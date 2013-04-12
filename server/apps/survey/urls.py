from django.conf.urls.defaults import *
from survey.views import *


urlpatterns = patterns('',
    (r'', survey),
    (r'answer', answer),
)
