from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min, Count
from django.contrib.auth.decorators import login_required

import simplejson

from apps.survey.models import Survey, Question, Response, Respondant
from apps.reports.models import QuestionReport


@login_required
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
