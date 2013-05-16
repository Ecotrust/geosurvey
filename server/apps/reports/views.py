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

    if request.GET:
        filter_value = request.GET.get('filter_value', None)
        filter_question_slug = request.GET.get('filter_question', None)

    if filter_question_slug is not None:
        filter_question = get_object_or_404(QuestionReport, slug=filter_question_slug, survey=survey)
    else:
        filter_question = None


    answer_domain = question.get_answer_domain(filter_question=filter_question, filter_value=filter_value)
    return HttpResponse(simplejson.dumps({'success': "true", "answer_domain": list(answer_domain.order_by('-count'))}))
