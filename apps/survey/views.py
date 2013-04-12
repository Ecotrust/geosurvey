# Create your views here.
from django.http import HttpResponse

import simplejson


def answer(request):
    return HttpResponse(simplejson.dumps({'success': True}))
