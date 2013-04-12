from django.conf.urls.defaults import *
from survey.views import *


urlpatterns = patterns('',
    (r'answer', answer),
)
