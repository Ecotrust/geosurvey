# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from tracker.models import Respondant


def register(request, template='tracker/register.html'):
    if request.POST:
        # create respondant record
        email = request.POST.get('emailAddress', None)
        if email is not None:
            respondant, created = Respondant.objects.get_or_create(email=email)
            print respondant.uuid
            return render_to_response('tracker/thankyou.html', RequestContext(request, {}))

    return render_to_response(template, RequestContext(request, {}))
