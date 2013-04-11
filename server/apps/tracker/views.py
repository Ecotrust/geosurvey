# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext


def register(request, template='tracker/register.html'):
    if request.POST:
        return render_to_response('tracker/thankyou.html', RequestContext(request, {}))

    return render_to_response(template, RequestContext(request, {}))
