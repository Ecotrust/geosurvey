from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields, utils

from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import DjangoAuthorization, Authorization
from django.conf.urls.defaults import url

from survey.models import Survey, Question, Option, Respondant, Response #, Page

class StaffUserOnlyAuthorization(Authorization):
    def read_list(self, object_list, bundle):
        # This assumes a ``QuerySet`` from ``ModelResource``.
        return True

    def read_detail(self, object_list, bundle):
        # Is the requested object owned by the user?
        return True

    def create_list(self, object_list, bundle):
        # Assuming their auto-assigned to ``user``.
        return bundle.request.user.is_staff

    def create_detail(self, object_list, bundle):
        return bundle.request.user.is_staff

    def update_list(self, object_list, bundle):
        return bundle.request.user.is_staff

    def update_detail(self, object_list, bundle):
        return bundle.request.user.is_staff

    def delete_list(self, object_list, bundle):
        # Sorry user, no deletes for you!
        return bundle.request.user.is_staff

    def delete_detail(self, object_list, bundle):
        return bundle.request.user.is_staff


# class PageResource(ModelResource):
#     question = fields.ToOneField('apps.survey.api.QuestionResource', 'question', full=True)
#     survey = fields.ToOneField('apps.survey.api.SurveyResource', 'question')
#     class Meta:
#         queryset = Page.objects.all()
#         ordering = ['order']


class ResponseResource(ModelResource):
    question = fields.ToOneField('apps.survey.api.QuestionResource', 'question', full=True)

    class Meta:
        queryset = Response.objects.all().order_by('question__order');

class RespondantResource(ModelResource):
    responses = fields.ToManyField(ResponseResource, 'responses', full=True)
    survey = fields.ToOneField('apps.survey.api.SurveyResource', 'survey', null=True, blank=True)
    class Meta:
        queryset = Respondant.objects.all()
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        filtering = {
            'survey': ALL_WITH_RELATIONS
        }
        ordering = ['-ts']

class OptionResource(ModelResource):
    class Meta:
        queryset = Option.objects.all()


class QuestionResource(ModelResource):
    options = fields.ToManyField(OptionResource, 'options', full=True)
    modalQuestion = fields.ToOneField('self', 'modalQuestion', full=True, null=True, blank=True)
    hoist_answers = fields.ToOneField('self', 'hoist_answers', full=True, null=True, blank=True)
    question_types = fields.DictField(attribute='question_types', readonly=True)



    class Meta:
        queryset = Question.objects.all().order_by('order')
        always_return_data = True
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()


class SurveyResource(ModelResource):
    questions = fields.ToManyField(QuestionResource, 'questions', full=True)
    completes = fields.IntegerField(attribute='completes', readonly=True)

    class Meta:
        queryset = Survey.objects.all()
        filtering = {
            'slug': ['exact']
        }
    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]