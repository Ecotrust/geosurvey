from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

from tastypie.api import Api

from apps.survey import urls as survey_urls
from apps.reports import urls as report_urls

from apps.survey.api import *
from apps.places.api import *

v1_api = Api(api_name='v1')

v1_api.register(SurveyResource())
v1_api.register(RespondantResource())
v1_api.register(PlaceResource())
v1_api.register(QuestionResource())
v1_api.register(ResponseResource())

v1_api.register(SurveyReportResource())

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^grappelli/', include('grappelli.urls')),
    (r'^api/', include(v1_api.urls)),


    url(r'^report', include(report_urls)),
    #anon survey user for specific survey
    url(r'^respond/(?P<survey_slug>[\w\d-]+)$', 'apps.survey.views.survey'),
    #survey responder with preassigned uuid
    url(r'^respond$', 'apps.survey.views.survey'),
    #other survey urls
    url(r'^respond', include(survey_urls)),

    # backend urls
    url(r'^dash/(?P<survey_slug>[\w\d-]+)$', 'apps.survey.views.dash'),
    #survey responder with preassigned uuid
    url(r'^dash$', 'apps.survey.views.dash'),
    #other survey urls
    url(r'^dash', include(survey_urls)),

    (r'^register', survey_urls.register),
    #(r'^survey/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.SURVEY_ROOT}),
    #(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
)

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.HEROKU:
    urlpatterns += (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
