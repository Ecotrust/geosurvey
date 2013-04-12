from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

from tastypie.api import Api

from apps.tracker import urls as tracker_urls
from apps.survey import urls as survey_urls
from apps.survey.api import SurveyResource




v1_api = Api(api_name='v1')
v1_api.register(SurveyResource())


admin.autodiscover()


urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^grappelli/', include('grappelli.urls')),
    (r'^api/', include(v1_api.urls)),
    url(r'^tracker', include(tracker_urls)),
    url(r'^respond', include(survey_urls)),
    (r'^survey/(?P<path>.*)$', 'django.views.static.serve',
            {'document_root': settings.SURVEY_ROOT}),
)

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
