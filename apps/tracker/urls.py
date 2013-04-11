from django.conf.urls.defaults import *
from tracker.views import *


urlpatterns = patterns('',
    (r'register', register),
)
