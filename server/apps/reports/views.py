from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min, Count, Sum
from django.contrib.admin.views.decorators import staff_member_required

import simplejson

from apps.survey.models import Survey, Question, Response, Respondant, Location, LocationAnswer, GridAnswer
from apps.reports.models import QuestionReport

@staff_member_required
def get_geojson(request, survey_slug, question_slug):
    survey = get_object_or_404(Survey, slug=survey_slug)
    question = get_object_or_404(QuestionReport, slug=question_slug, survey=survey)
    locations = LocationAnswer.objects.filter(location__response__respondant__survey=survey, location__respondant__complete=True)
    
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
            filter_question = QuestionReport.objects.get(slug=slug, survey=survey)
            locations = locations.filter(location__respondant__responses__in=filter_question.response_set.filter(answer__in=value))

    geojson = [];
    for location in locations:
        d = {
            'type': "Feature",
            'properties': {
                'activity': location.answer,
                'label': location.label
            },
            'geometry': {
                'type': "Point",
                'coordinates': [location.location.lng,location.location.lat]
            }
        }
        geojson.append(d)

    
    return HttpResponse(simplejson.dumps({'success': "true", 'geojson': geojson}))

@staff_member_required
def get_distribution(request, survey_slug, question_slug):
    survey = get_object_or_404(Survey, slug=survey_slug)
    print question_slug
    if question_slug.find('*') == -1:
        question = get_object_or_404(QuestionReport, slug=question_slug, survey=survey)
        answers = question.response_set.filter(respondant__complete=True)
        question_type = question.type
    else:
        questions = Question.objects.filter(slug__contains=question_slug.replace('*', ''), survey=survey)
        answers = Response.objects.filter(question__in=questions)
        question_type = questions.values('type').distinct()[0]['type']

    filter_question_slug = None
    filter_value = None

    filter_list = []

    if request.method == 'GET':
        filter_value = request.GET.get('filter_value')
        filter_question_slug = request.GET.get('filter_question')
        filters = request.GET.get('filters', None)

    if filters is not None:
        filter_list = simplejson.loads(filters)
    else:
        filter_question = None

    if question_type in ['map-multipoint']:
        locations = LocationAnswer.objects.filter(location__response__in=answers)
    if filters is not None:    
        for filter in filters:
            slug = filter.keys()[0]
            value = filter[slug]
            filter_question = QuestionReport.objects.get(slug=slug, survey=survey)
           
            if question_type in ['map-multipoint']:
                if filter_question == self:
                    locations = locations.filter(answer__in=value)
                else:
                    answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
                    locations = locations.filter(location__response__in=answers)
            else:
                answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
    if question_type in ['grid']:
        answer_domain =  GridAnswer.objects.filter(response__in=answers).values('row_text', 'col_text').annotate(total=Sum('answer_number')).order_by('row_text')
        print GridAnswer.objects.filter(response__in=answers).values('row_label', 'col_label').annotate(total=Sum('answer_number')).order_by('row_label').query
        # return answers.values('answer').annotate(locations=Sum('respondant__locations'), surveys=Count('answer'))
    elif question_type in ['map-multipoint']:
        answer_domain = locations.values('answer').annotate(locations=Count('answer'), surveys=Count('location__respondant', distinct=True))
    else:
        answer_domain = answers.values('answer').annotate(locations=Sum('respondant__locations'), surveys=Count('answer'))

    return HttpResponse(simplejson.dumps({'success': "true", "answer_domain": list(answer_domain)}))

@staff_member_required
def get_crosstab(request, survey_slug, question_a_slug, question_b_slug):
    start_date = request.GET.get('startdate', None)
    end_date = request.GET.get('enddate', None)
    group = request.GET.get('group', None)
    print "cross tab"
    try:
        if start_date is not None:
            start_date = datetime.datetime.strptime(start_date, '%Y%m%d') - datetime.timedelta(days=1)

        if end_date is not None:
            end_date = datetime.datetime.strptime(end_date, '%Y%m%d') + datetime.timedelta(days=1)

        survey = Survey.objects.get(slug = survey_slug)

        question_a = Question.objects.get(slug = question_a_slug, survey=survey)
        question_b = Question.objects.get(slug = question_b_slug, survey=survey)
        date_question = Question.objects.get(slug = 'survey-date', survey=survey)
        question_a_responses = Response.objects.filter(question=question_a)

        if start_date is not None and end_date is not None:
            question_a_responses = question_a_responses.filter(respondant__ts__lte=end_date, respondant__ts__gte=start_date)
        crosstab = []
        obj = {}
        values_count = 0

        for question_a_answer in question_a_responses.order_by('answer').values('answer').distinct():
            respondants = Respondant.objects.all()

            if start_date is not None and end_date is not None:
                #respondants = respondants.filter(responses__in=date_question.response_set.filter(answer_date__gte=start_date))
                respondants = respondants.filter(ts__lte=end_date, ts__gte=start_date)

            respondants = respondants.filter(responses__in=question_a_responses.filter(answer=question_a_answer['answer']))

            # if end_date is not None:
            #     #respondants = respondants.filter(respondantsesponses__in=date_question.response_set.filter(answer_date__lte=end_date))
                
            
            if question_b.type in ['grid']:
                obj['type'] = 'stacked-column'
                rows = Response.objects.filter(respondant__in=respondants, question=question_b)[0].gridanswer_set.all().values('row_text','row_label').order_by('row_label')
                obj['seriesNames'] = [row['row_text'] for row in rows]
                crosstab.append({
                    'name': question_a_answer['answer'],
                    'value': list(rows.annotate(average=Avg('answer_number')))
                })
            elif question_b.type in ['currency', 'integer', 'number']:
                if group is None:
                    obj['type'] = 'bar-chart'
                    d = {
                        'name': question_a_answer['answer'],
                        'value': Response.objects.filter(respondant__in=respondants, question=question_b).aggregate(sum=Sum('answer_number'))['sum']
                    }
                else:
                    obj['type'] = 'time-series'
                    values = Response.objects.filter(respondant__in=respondants, question=question_b).extra(select={ 'date': "date_trunc('%s', ts)" % group}).order_by('date').values('date').annotate(sum=Sum('answer_number'))
                    
                    d = {
                        'name': question_a_answer['answer'],
                        'value': list(values)
                    }
        
                crosstab.append(d)

            obj['crosstab'] = crosstab
            obj['success'] = 'true'
        return HttpResponse(json.dumps(obj, cls=DjangoJSONEncoder))
    except Exception, err:
        print Exception, err
        return HttpResponse(json.dumps({'success': False, 'message': "No records for this date range." }))    
