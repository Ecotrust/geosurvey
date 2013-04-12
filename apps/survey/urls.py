from django.conf.urls.defaults import *
from survey.views import *


urlpatterns = patterns('',
    
    (r'/answer/(?P<survey_slug>[\w\d-]+)/(?P<question_slug>[\w\d-]+)/(?P<uuid>[\w\d-]+)', answer),
)
