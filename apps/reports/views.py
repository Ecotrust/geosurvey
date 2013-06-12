from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min, Count
from django.contrib.admin.views.decorators import staff_member_required

import simplejson

from apps.survey.models import Survey, Question, Response, Respondant, Location, LocationAnswer
from apps.reports.models import QuestionReport

@staff_member_required
def get_geojson(request, survey_slug, question_slug):
    survey = get_object_or_404(Survey, slug=survey_slug)
    question = get_object_or_404(QuestionReport, slug=question_slug, survey=survey)
    locations = LocationAnswer.objects.filter(location__response__respondant__survey=survey)
    
    filter_item = request.GET.get('filter', None)

    if filter_item is not None:
        locations = locations.filter(label=filter_item)

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
    question = get_object_or_404(QuestionReport, slug=question_slug, survey=survey)

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
    print question.type
    answer_domain = question.get_answer_domain(survey, filter_list)
    return HttpResponse(simplejson.dumps({'success': "true", "answer_domain": list(answer_domain.order_by('-count'))}))
