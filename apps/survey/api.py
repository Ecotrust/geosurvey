from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields, utils

from django.conf.urls.defaults import url

from survey.models import Survey, Question, Option

class OptionResource(ModelResource):
    class Meta:
        queryset = Option.objects.all()


class QuestionResource(ModelResource):
    options = fields.ToManyField(OptionResource, 'options', full=True)

    class Meta:
        queryset = Question.objects.all()


class SurveyResource(ModelResource):
    questions = fields.ToManyField(QuestionResource, 'questions', full=True)

    class Meta:
        queryset = Survey.objects.all()

    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]