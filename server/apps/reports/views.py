import calendar
import csv
import datetime
import json
from collections import defaultdict
from decimal import Decimal

from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Avg, Count, Min, Max, Sum
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404

from ordereddict import OrderedDict

import simplejson

from apps.survey.models import Survey, Question, Response, Respondant, Location, LocationAnswer, GridAnswer, MultiAnswer
from .decorators import api_user_passes_test
from .forms import APIFilterForm, GridStandardDeviationForm, SurveyorStatsForm
from .utils import SlugCSVWriter

@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def get_geojson(request, survey_slug, question_slug):
    survey = get_object_or_404(Survey, slug=survey_slug)
    locations = LocationAnswer.objects.filter(location__response__respondant__survey=survey,
                                              location__respondant__complete=True)

    filter_list = []
    filters = None

    if request.GET:    
        filters = request.GET.get('filters', None)

    if filters is not None:
        filter_list = simplejson.loads(filters)

    if filters is not None:
        for filter in filter_list:
            slug = filter.keys()[0]
            value = filter[slug]
            filter_question = Question.objects.get(slug=slug, survey=survey)
            if filter_question.type == 'map-multipoint':
                locations = locations.filter(answer__in=value)
            else:
                locations = locations.filter(location__respondant__responses__in=filter_question.response_set.filter(answer__in=value))

    return HttpResponse(simplejson.dumps({'success': "true", 'geojson': list(locations.values('geojson'))}))

@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def get_distribution(request, survey_slug, question_slug):
    survey = get_object_or_404(Survey, slug=survey_slug)
    question = get_object_or_404(Question, slug=question_slug, survey=survey)

    filter_question_slug = None
    filter_value = None

    filter_list = []

    if request.GET:
        filter_value = request.GET.get('filter_value')
        filter_question_slug = request.GET.get('filter_question')
        filters = request.GET.get('filters', None)

    if filters is not None:
        filter_list = simplejson.loads(filters)
        
    else:
        filter_question = None
    answer_domain = question.get_answer_domain(survey, filter_list)
    return HttpResponse(simplejson.dumps({'success': "true", "answer_domain": list(answer_domain)}))






def _error(message='An error occurred.', **kwargs):
    return HttpResponse(json.dumps({
        'success': False,
        'message': message,
        'errors': kwargs
    }))


def _get_crosstab(filters, survey_slug, question_a_slug, question_b_slug):
    start_date = filters.get('startdate', None)
    end_date = filters.get('enddate', None)
    group = filters.get('group', None)
    market = filters.get('market', None)
    status = filters.get('status', None)
    try:
        if start_date is not None:
            start_date = datetime.datetime.strptime(start_date, '%Y%m%d') - datetime.timedelta(days=1)

        if end_date is not None:
            end_date = datetime.datetime.strptime(end_date, '%Y%m%d') + datetime.timedelta(days=1)

        survey = Survey.objects.get(slug=survey_slug)

        question_a = Question.objects.get(slug=question_a_slug, survey=survey)
        question_b = Question.objects.get(slug=question_b_slug, survey=survey)
        question_a_responses = Response.objects.filter(question=question_a)

        if start_date is not None and end_date is not None:
            question_a_responses = question_a_responses.filter(respondant__ts__range=(start_date, end_date))

        if market is not None:
            question_a_responses = question_a_responses.filter(respondant__survey_site=market)

        if status is not None:
            question_a_responses = question_a_responses.filter(respondant__review_status=status)

        crosstab = []
        obj = {
            'question_a': question_a.title,
            'question_b': question_b.title
        }

        for question_a_answer in question_a_responses.order_by('answer').values('answer').distinct():
            respondants = Respondant.objects.all()

            if start_date is not None and end_date is not None:
                respondants = respondants.filter(ts__lte=end_date, ts__gte=start_date)

            respondants = respondants.filter(response__in=question_a_responses.filter(answer=question_a_answer['answer']))
            if question_b.type == 'grid':
                obj['type'] = 'stacked-column'
                rows = (GridAnswer.objects.filter(response__respondant__in=respondants,
                                                  response__question=question_b)
                                          .values('row_text', 'row_label')
                                          .order_by('row_label')
                                          .distinct()
                                          .annotate(average=Avg('answer_number')))

                row_vals = set(rows.values_list('row_text', flat=True))
                if 'seriesNames' in obj:
                    obj['seriesNames'] |= row_vals
                else:
                    obj['seriesNames'] = row_vals

                for row in rows:
                    row['average'] = int(row['average'])
                crosstab.append({
                    'name': question_a_answer['answer'],
                    'value': list(rows)
                })

            elif question_b.type == 'multi-select':
                obj['type'] = 'stacked-column-count'
                rows = (MultiAnswer.objects.filter(response__respondant__in=respondants,
                                                   response__question=question_b)
                                           .values('answer_text', 'answer_label')
                                           .order_by('answer_text')
                                           .annotate(count=Count('answer_text')))

                row_vals = set(rows.values_list('answer_text', flat=True))
                if 'seriesNames' in obj:
                    obj['seriesNames'] |= row_vals
                else:
                    obj['seriesNames'] = row_vals

                crosstab.append({
                    'name': question_a_answer['answer'],
                    'value': list(rows)
                })
            elif question_b.type in ['currency', 'integer', 'number']:
                if group is None:
                    obj['type'] = 'bar-chart'
                    d = {
                        'name': question_a_answer['answer'],
                        'value': (Response.objects.filter(respondant__in=respondants, question=question_b)
                                                  .aggregate(sum=Sum('answer_number'))['sum'])
                    }
                else:
                    obj['type'] = 'time-series'
                    values = Response.objects.filter(respondant__in=respondants, question=question_b)
                    if start_date is not None and end_date is not None:
                        values = values.filter(respondant__ts__lte=end_date,
                                               respondant__ts__gte=start_date)

                    values = (values.extra(select={'date': "date_trunc(%s, survey_respondant.ts)"},
                                           select_params=(group,),
                                           tables=('survey_respondant',))
                                    .order_by('date')
                                    .values('date')
                                    .annotate(sum=Sum('answer_number')))

                    d = {
                        'name': question_a_answer['answer'],
                        'value': list(values)
                    }

                crosstab.append(d)

            obj['crosstab'] = crosstab
            obj['success'] = 'true'
        if 'seriesNames' in obj:
            obj['seriesNames'] = sorted(obj['seriesNames'])
        return obj
    except Exception, err:
        print Exception, err
        return _error('No records for this range.', __all__=str(err))


def _create_csv_response(filename):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="{0}"'.format(filename)
    return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def get_crosstab_csv(request, survey_slug, question_a_slug, question_b_slug):
    obj = _get_crosstab(request.GET, survey_slug, question_a_slug, question_b_slug)
    if isinstance(obj, HttpResponse):
        return obj

    response = _create_csv_response('crosstab-{0}-{1}.csv'.format(question_a_slug, question_b_slug))
    if obj['type'] in ('stacked-column', 'stacked-column-count'):
        fields = obj['seriesNames']
        fields.insert(0, obj['question_a'])

        writer = csv.DictWriter(response, fields)
        writer.writerow(dict((fn, fn) for fn in fields))
        for row in obj['crosstab']:
            data = {
                obj['question_a']: row['name']
            }
            for v in row['value']:
                if obj['type'] == 'stacked-column':
                    data[v['row_text']] = v['average']
                else:
                    data[v['answer_text']] = v['count']
            writer.writerow(data)
    elif obj['type'] == 'bar-chart':
        writer = csv.writer(response)
        writer.writerow((obj['question_a'], obj['question_b']))
        for row in obj['crosstab']:
            writer.writerow((row['name'], row['value']))
    elif obj['type'] == 'time-series':
        writer = csv.writer(response)
        writer.writerow((obj['question_a'], 'date', obj['question_b']))
        for row in obj['crosstab']:
            for v in row['value']:
                writer.writerow((row['name'], v['date'], v['sum']))
    return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def get_crosstab_json(request, survey_slug, question_a_slug, question_b_slug):
    obj = _get_crosstab(request.GET, survey_slug, question_a_slug, question_b_slug)
    if isinstance(obj, HttpResponse):
        return obj
    return HttpResponse(json.dumps(obj, cls=DjangoJSONEncoder),
                        content_type='application/json')


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return str(obj)
        return super(CustomJSONEncoder, self).default(obj)


def _get_fullname(data):
    return ('{0} {1}'.format(data.pop('surveyor__first_name'),
                             data.pop('surveyor__last_name'))
            .strip())


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def surveyor_stats_json(request, survey_slug, interval):
    form = SurveyorStatsForm(request.GET)
    if not form.is_valid():
        return _error(**form.errors)

    res = Respondant.stats_report_filter(survey_slug, **form.cleaned_data)

    if not res.exists():
        return _error('No records for these filters.')

    res = (res.extra(select={'timestamp': "date_trunc(%s, ts)"},
                     select_params=(interval,))
              .values('surveyor__first_name', 'surveyor__last_name',
                      'timestamp')
              .annotate(count=Count('pk')))

    res = res.order_by('timestamp')

    grouped_data = defaultdict(list)

    for respondant in res:
        name = _get_fullname(respondant)
        grouped_data[name].append(
            (calendar.timegm(respondant['timestamp'].utctimetuple()) * 1000,
             respondant['count'])
        )

    graph_data = []
    for name, data in grouped_data.iteritems():
        graph_data.append({'data': data, 'name': name})

    return HttpResponse(json.dumps({
        'success': True,
        'graph_data': graph_data
    }, cls=CustomJSONEncoder), content_type='application/json')


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def surveyor_stats_csv(request, survey_slug, interval):
    form = SurveyorStatsForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))

    res = Respondant.stats_report_filter(survey_slug, **form.cleaned_data)

    res = (res.extra(select={'timestamp': "date_trunc(%s, ts)"},
                     select_params=(interval,))
              .values('surveyor__first_name', 'surveyor__last_name',
                      'timestamp')
              .annotate(count=Count('pk')))

    response = _create_csv_response('raw_surveyor_stats.csv')
    writer = csv.writer(response)
    writer.writerow(('Surveyor', 'timestamp', 'count'))
    for row in res:
        writer.writerow((_get_fullname(row), row['timestamp'], row['count']))

    return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def surveyor_stats_raw_data_csv(request, survey_slug):
    form = SurveyorStatsForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))

    res = (Respondant.stats_report_filter(survey_slug, **form.cleaned_data)
                     .select_related('surveyor'))

    response = _create_csv_response('surveyor_stats.csv')
    writer = csv.writer(response)
    writer.writerow(('Surveyor', 'market', 'timestamp', 'status'))
    for row in res:
        writer.writerow((row.surveyor.get_full_name() if row.surveyor else '',
                         row.survey_site, row.ts, row.review_status))

    return response


def _grid_standard_deviation(interval, question_slug, row=None, market=None,
                             col=None, status=None, start_date=None, end_date=None):
    rows = (GridAnswer.objects.filter(response__question__slug=question_slug)
                              .extra(select={'date': "date_trunc(%s, survey_response.ts)"},
                                     select_params=(interval,),
                                     tables=('survey_response',)))
    if row is not None:
        rows = rows.filter(row_label=row)
    if col is not None:
        rows = rows.filter(col_label=col)
    if market is not None:
        rows = rows.filter(response__respondant__survey_site=market)
    if status is not None:
        rows = rows.filter(response__respondant__review_status=status)
    if start_date is not None:
        rows = rows.filter(response__respondant__ts__gte=start_date)
    if end_date is not None:
        rows = rows.filter(response__respondant__ts__lt=end_date)

    labels = list(rows.values_list('row_label', flat=True).distinct())
    rows = (rows.values('row_text', 'row_label', 'date')
                .order_by('date')
                .annotate(minimum=Min('answer_number'),
                          average=Avg('answer_number'),
                          maximum=Max('answer_number'),
                          total=Sum('answer_number')))
    return rows, labels


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def grid_standard_deviation_json(request, question_slug, interval):
    form = GridStandardDeviationForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, labels = _grid_standard_deviation(interval, question_slug,
                                            **form.cleaned_data)
    graph_data = defaultdict(list)
    for row in rows:
        row['date'] = calendar.timegm(row['date'].utctimetuple()) * 1000
        graph_data[row['row_text']].append(row)

    return HttpResponse(json.dumps({
        'success': True,
        'graph_data': graph_data,
        'labels': list(labels),
    }, cls=CustomJSONEncoder), content_type='application/json')


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def grid_standard_deviation_csv(request, question_slug, interval):
    form = GridStandardDeviationForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, labels = _grid_standard_deviation(interval, question_slug,
                                            **form.cleaned_data)
    response = _create_csv_response('grid_standard_deviation_{0}_{1}.csv'.format(
                                    question_slug, interval))
    rows, _ = _grid_standard_deviation(interval, question_slug,
                                       **form.cleaned_data)

    field_names = OrderedDict((
        ('row_text', 'Type'),
        ('date', 'Date'),
        ('minimum', 'Minimum'),
        ('average', 'Average'),
        ('maximum', 'Maximum'),
        ('total', 'Total')
    ))

    writer = SlugCSVWriter(response, field_names)
    writer.writeheader()
    for row in rows:
        row.pop('row_label')
        row['date'] = str(row['date'])
        writer.writerow(row)
    return response


def _vendor_resource_type_frequency(market=None, status=None, start_date=None,
                                    end_date=None):
    base_values = Question.objects.get(slug='type-of-fish').rows.splitlines()
    rows = (MultiAnswer.objects.filter(response__question__slug='type-of-fish',
                                       answer_text__in=base_values))
    if market is not None:
        rows = rows.filter(response__respondant__survey_site=market)
    if status is not None:
        rows = rows.filter(response__respondant__review_status=market)
    if start_date is not None:
        rows = rows.filter(response__respondant__ts__gte=start_date)
    if end_date is not None:
        rows = rows.filter(response__respondant__ts__lt=end_date)

    response_count = (rows.values_list('response__respondant', flat=True)
                    .distinct()
                    .count())
    rows = (rows.values('answer_text')
                .annotate(count=Count('response__respondant',
                                      distinct=True)))
    for row in rows:
        row['percent'] = '%.2f' % (float(row['count']) / response_count)

    return rows, response_count


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def vendor_resource_type_frequency_csv(request):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, vendor_count = _vendor_resource_type_frequency(**form.cleaned_data)

    response = _create_csv_response('vendor_resource_frequency.csv')
    field_names = OrderedDict((
        ('answer_text', 'Fish Family'),
        ('count', 'Count'),
        ('percent', 'Percent')
    ))

    writer = SlugCSVWriter(response, field_names)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def vendor_resource_type_frequency_json(request):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, vendor_count = _vendor_resource_type_frequency(**form.cleaned_data)

    return HttpResponse(json.dumps({
        'success': True,
        'graph_data': list(rows),
        'vendor_count': vendor_count
    }, cls=CustomJSONEncoder), content_type='application/json')


def _single_select_count(question_slug, market=None, status=None,
                         start_date=None, end_date=None):
    question = Question.objects.get(slug=question_slug)
    rows = Response.objects.filter(question=question)
    labels = None
    if question.rows:
        labels = question.rows.splitlines()
        rows = rows.filter(answer__in=labels)

    if market is not None:
        rows = rows.filter(respondant__survey_site=market)
    if status is not None:
        rows = rows.filter(respondant__review_status=status)
    if start_date is not None:
        rows = rows.filter(respondant__ts__gte=start_date)
    if end_date is not None:
        rows = rows.filter(respondant__ts__lt=end_date)

    if labels is None:
        labels = rows.distinct().values_list('answer', flat=True)

    rows = (rows.values('answer')
                .annotate(count=Count('answer')))
    return rows, labels


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def single_select_count_json(request, question_slug):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, labels = _single_select_count(question_slug, **form.cleaned_data)

    return HttpResponse(json.dumps({
        'success': True,
        'graph_data': list(rows),
        'labels': list(labels)
    }, cls=CustomJSONEncoder), content_type='application/json')


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def single_select_count_csv(request, question_slug):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows, labels = _single_select_count(question_slug, **form.cleaned_data)

    response = _create_csv_response('vendor_resource_frequency.csv')
    field_names = OrderedDict((
        ('answer', question_slug),
        ('count', 'Count'),
    ))

    writer = SlugCSVWriter(response, field_names)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return response


def _gear_type_frequency(market=None, status=None, start_date=None,
                         end_date=None):
    question = Question.objects.get(slug='type-of-gear')
    labels = question.rows.splitlines()
    rows = MultiAnswer.objects.filter(response__question=question,
                                      answer_text__in=labels)

    if market is not None:
        rows = rows.filter(response__respondant__survey_site=market)
    if status is not None:
        rows = rows.filter(response__respondant__review_status=market)
    if start_date is not None:
        rows = rows.filter(response__respondant__ts__gte=start_date)
    if end_date is not None:
        rows = rows.filter(response__respondant__ts__lt=end_date)

    ma_count_values = (rows.values('response__respondant__survey_site')
                           .annotate(count=Count('response__respondant__survey_site')))

    rows = (rows.values('answer_text', 'response__respondant__survey_site')
                .annotate(count=Count('answer_text')))

    ma_count = {}
    for count in ma_count_values:
        ma_count[count['response__respondant__survey_site']] = count['count']

    graph_data = defaultdict(list)
    for row in rows:
        row_market = row['response__respondant__survey_site']
        graph_data[row_market].append({
            'market': row_market,
            'percent': '%.2f' % (float(row['count']) / ma_count[row_market]),
            'count': row['count'],
            'type': row['answer_text'],
        })

    return graph_data


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def gear_type_frequency_json(request):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows = _gear_type_frequency(**form.cleaned_data)

    return HttpResponse(json.dumps({
        'success': True,
        'graph_data': rows,
    }, cls=CustomJSONEncoder), content_type='application/json')


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def gear_type_frequency_csv(request):
    form = APIFilterForm(request.GET)
    if not form.is_valid():
        return HttpResponseBadRequest(json.dumps(form.errors))
    rows = _gear_type_frequency(**form.cleaned_data)

    response = _create_csv_response('vendor_resource_frequency.csv')
    field_names = OrderedDict((
        ('market', 'Market'),
        ('type', 'Gear Type'),
        ('percent', 'Percent'),
        ('count', 'Count'),
    ))

    writer = SlugCSVWriter(response, field_names)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def full_data_dump_csv(request, survey_slug):
    survey = Survey.objects.get(slug=survey_slug)
    response = _create_csv_response('full_dump_{0}.csv'.format(
        datetime.date.today().strftime('%d-%m-%Y')))

    fields = OrderedDict(Respondant.get_field_names().items() +
                         survey.generate_field_names().items())


    writer = SlugCSVWriter(response, fields)
    writer.writeheader()
    for resp in survey.respondant_set.filter(complete=True):
        # very basic removal of some characters that were causing issue in writing rows
        row_string = resp.csv_row.json_data.replace('\u2019', '\'')
        row_string = row_string.replace('\u2026', '\'')
        writer.writerow(json.loads(row_string))
    return response


# @api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
# def activity_locations_csv(request, survey_slug):
#     response = _create_csv_response('activity_locations_{0}.csv'.format(
#         datetime.date.today().strftime('%d-%m-%Y')))

#     fields = OrderedDict((
#         ('uuid', 'UUID'),
#         ('lat', 'Latitude'),
#         ('lng', 'Longitude'),
#         ('activity', 'Activity'),
#     ))

#     writer = SlugCSVWriter(response, fields)
#     writer.writeheader()

#     resps = Response.objects.filter(respondant__survey__slug=survey_slug
#         ).exclude(respondant__complete__exact=False
#         ).filter(question__slug='activity-locations')

#     for resp in resps:
#         for location in resp.location_set.all():
#             locationAnswers = LocationAnswer.objects.filter(location__exact=location)
#             for locationAnswer in locationAnswers: 
#                 writer.writerow({
#                     'uuid': resp.respondant.uuid, 
#                     'lat': str(location.lat), 
#                     'lng': str(location.lng), 
#                     'activity': locationAnswer.answer })

#     return response



# @api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
# def activity_locations_csv(request, survey_slug):
#     response = _create_csv_response('activity_locations_{0}.csv'.format(
#         datetime.date.today().strftime('%d-%m-%Y')))

#     fields = OrderedDict((
#         ('uuid', 'UUID'),
#         ('lat', 'Latitude'),
#         ('lng', 'Longitude'),
#         ('activity', 'Activity'),
#     ))

#     writer = SlugCSVWriter(response, fields)
#     writer.writeheader()

#     respondants = Respondant.objects.filter(survey__slug=survey_slug).exclude(complete__exact=False).order_by('-ts')

#     for respondant in respondants:
#         for resp in respondant.response_set.filter(question__slug='activity-locations'):
#             for location in resp.location_set.all():
#                 locationAnswers = LocationAnswer.objects.filter(location__exact=location)
#                 for locationAnswer in locationAnswers: 
#                     writer.writerow({
#                         'uuid': resp.respondant.uuid, 
#                         'lat': str(location.lat), 
#                         'lng': str(location.lng), 
#                         'activity': locationAnswer.answer })

#     return response


@api_user_passes_test(lambda u: u.is_staff or u.is_superuser)
def activity_locations_csv(request, survey_slug):
    response = _create_csv_response('activity_locations_{0}.csv'.format(
        datetime.date.today().strftime('%d-%m-%Y')))

    fields = OrderedDict((
        ('uuid', 'UUID'),
        ('lat', 'Latitude'),
        ('lng', 'Longitude'),
        ('activity', 'Activity'),
    ))

    writer = SlugCSVWriter(response, fields)
    writer.writeheader()

    survey = Survey.objects.get(slug=survey_slug)
    locations = Location.objects.filter(response__respondant__in=survey.respondant_set.filter(complete=True)).order_by('response__respondant__uuid')

    for location in locations.filter(response__question__slug='activity-locations'):
        for locationAnswer in LocationAnswer.objects.filter(location__exact=location): 
            writer.writerow({
                'uuid': location.response.respondant.uuid, 
                'lat': str(location.lat), 
                'lng': str(location.lng), 
                'activity': locationAnswer.answer })

    return response
