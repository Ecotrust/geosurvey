# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

import simplejson


def survey(request, template='survey/survey.html'):
    return render_to_response(template, RequestContext(request, {}))


def answer(request, survey_slug, question_slug, uuid): #, survey_slug, question_slug, uuid):
    return HttpResponse(simplejson.dumps({'success': "%s/%s/%s" % (survey_slug, question_slug, uuid)}))
