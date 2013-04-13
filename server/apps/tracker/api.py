from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields, utils
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import DjangoAuthorization

from django.conf.urls.defaults import url

from tracker.models import Respondant


class RespondantResource(ModelResource):
    class Meta:
        queryset = Respondant.objects.all()
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()