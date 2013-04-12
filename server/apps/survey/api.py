from tastypie.resources import ModelResource
from survey.models import Survey


class SurveyResource(ModelResource):
    class Meta:
        queryset = Survey.objects.all()
