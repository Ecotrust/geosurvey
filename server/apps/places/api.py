from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields, utils

from places.models import *


class PlaceResource(ModelResource):

    class Meta:
        queryset = Place.objects.all().order_by("name");
        filtering = {
            'name': ['exact', 'startswith', 'endswith', 'contains']
        }
