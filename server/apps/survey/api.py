from tastypie.resources import ModelResource
from tastypie import fields, utils

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
