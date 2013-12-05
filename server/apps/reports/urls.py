from django.conf.urls import *
from reports.views import *


urlpatterns = patterns('',

    (r'/distribution/(?P<survey_slug>[\w\d-]+)/(?P<question_slug>[*\w\d-]+)', get_distribution),
    (r'/geojson/(?P<survey_slug>[\w\d-]+)/(?P<question_slug>[\w\d-]+)', get_geojson),
    (r'/crosstab/(?P<survey_slug>[\w\d-]+)/(?P<question_a_slug>[\w\d-]+)/(?P<question_b_slug>[\w\d-]+)', get_crosstab),
    (r'/respondants_summary/', get_respondants_summary),
)
