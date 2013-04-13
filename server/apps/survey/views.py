# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.shortcuts import get_object_or_404

import simplejson

from apps.survey.models import Survey, Question, Response
from apps.tracker.models import Respondant


def survey(request, template='survey/survey.html'):
    return render_to_response(template, RequestContext(request, {}))


def answer(request, survey_slug, question_slug, uuid): #, survey_slug, question_slug, uuid):
    if request.method == 'POST':
        survey = get_object_or_404(Survey, slug=survey_slug)
        question = get_object_or_404(Question, slug=question_slug)
        respondant = get_object_or_404(Respondant, uuid=uuid)
        response, created = Response.objects.get_or_create(question=question,respondant=respondant)
        response.answer = simplejson.loads(request.POST.keys()[0]).get('answer', None)
        response.save()

        return HttpResponse(simplejson.dumps({'success': "%s/%s/%s" % (survey_slug, question_slug, uuid)}))
    return HttpResponse(simplejson.dumps({'success': False}))
