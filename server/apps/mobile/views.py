from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
import simplejson
import datetime
import path
import re

def getVersion(request):    
    with open(settings.PROJECT_ROOT / '../mobile/www/config.xml') as f:
        content = f.read()
        version = re.search('version="(\d+\.\d+\.\d+)"', content).group(1)
    return HttpResponse(simplejson.dumps({'success': True, 'version': version }))
