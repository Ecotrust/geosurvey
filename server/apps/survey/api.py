from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie import fields, utils

from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import DjangoAuthorization, Authorization
from django.conf.urls import url
from django.db.models import Avg, Max, Min, Count

from survey.models import Survey, Question, Option, Respondant, Response, Page, Block

class SurveyModelResource(ModelResource):
    def obj_update(self, bundle, request=None, **kwargs):
        bundle = super(SurveyModelResource, self).obj_update(bundle, **kwargs)
        for field_name in self.fields:
            field = self.fields[field_name]
            if type(field) is fields.ToOneField and field.null and bundle.data.get(field_name, None) is None:
                setattr(bundle.obj, field_name, None)

        bundle.obj.save()

        return bundle

class StaffUserOnlyAuthorization(Authorization):

    # def create_list(self, object_list, bundle):
    #     # Assuming their auto-assigned to ``user``.
    #     return bundle.request.user.is_staff

    # def create_detail(self, object_list, bundle):
    #     return bundle.request.user.is_staff

    def update_list(self, object_list, bundle):
        return bundle.request.user.is_staff

    def update_detail(self, object_list, bundle):
        return bundle.request.user.is_staff

    def delete_list(self, object_list, bundle):
        # Sorry user, no deletes for you!
        return bundle.request.user.is_staff

    def delete_detail(self, object_list, bundle):
        return bundle.request.user.is_staff


# class PageResource(SurveyModelResource):
#     question = fields.ToOneField('apps.survey.api.QuestionResource', 'question', full=True)
#     survey = fields.ToOneField('apps.survey.api.SurveyResource', 'question')
#     class Meta:
#         queryset = Page.objects.all()
#         ordering = ['order']


class ResponseResource(SurveyModelResource):
    question = fields.ToOneField('apps.survey.api.QuestionResource', 'question', full=True)
    answer_count = fields.IntegerField(readonly=True)

    class Meta:
        queryset = Response.objects.all()
        filtering = {
            'answer': ALL,
            'question': ALL_WITH_RELATIONS
        }
        ordering = ['question__order']

class OfflineResponseResource(SurveyModelResource):
    question = fields.ToOneField('apps.survey.api.QuestionResource', 'question', null=True, blank=True)

    class Meta:
        queryset = Response.objects.all()
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()

class OfflineRespondantResource(SurveyModelResource):
    responses = fields.ToManyField(OfflineResponseResource, 'responses', null=True, blank=True)
    survey = fields.ToOneField('apps.survey.api.SurveyResource', 'survey', null=True, blank=True)
    class Meta:
        # always_return_data = True
        queryset = Respondant.objects.all()
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()
        ordering = ['-ts']
    
    def obj_create(self, bundle, **kwargs):
        return super(OfflineRespondantResource, self).obj_create(bundle, surveyor=bundle.request.user)


class ReportRespondantResource(SurveyModelResource):
    responses = fields.ToManyField(ResponseResource, 'responses', full=True, null=True, blank=True)
    survey = fields.ToOneField('apps.survey.api.SurveyResource', 'survey', null=True, blank=True, readonly=True)
    user = fields.ToOneField('apps.account.api.UserResource', 'surveyor', null=True, blank=True, full=True, readonly=True)

    class Meta:
        queryset = Respondant.objects.all().order_by('-ts')
        filtering = {
            'survey': ALL_WITH_RELATIONS,
            'responses': ALL_WITH_RELATIONS
        }
        ordering = ['-ts']
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()


class RespondantResource(SurveyModelResource):
    responses = fields.ToManyField(ResponseResource, 'responses', full=True, null=True, blank=True)
    survey = fields.ToOneField('apps.survey.api.SurveyResource', 'survey', null=True, blank=True, full=True, readonly=True)
    user = fields.ToOneField('apps.account.api.UserResource', 'surveyor', null=True, blank=True, full=True, readonly=True)
    class Meta:
        queryset = Respondant.objects.all().order_by('-ts')
        filtering = {
            'survey': ALL_WITH_RELATIONS,
            'responses': ALL_WITH_RELATIONS
        }
        ordering = ['-ts']
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()


class OptionResource(SurveyModelResource):
    class Meta:
        always_return_data = True
        queryset = Option.objects.all().order_by('order');
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()


    def save_m2m(self, bundle):
        pass


class PageResource(SurveyModelResource):
    questions = fields.ToManyField('apps.survey.api.QuestionResource', 'questions', full=True, null=True, blank=True)
    blocks = fields.ToManyField('apps.survey.api.BlockResource', 'blocks', full=True, null=True, blank=True)
    survey = fields.ForeignKey('apps.survey.api.SurveyResource', 'survey', related_name='survey', null=True, blank=True)
    class Meta:
        queryset = Page.objects.all().order_by('order')
        always_return_data = True
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()
        filtering = {
            'survey': ALL_WITH_RELATIONS
        }

    def save_m2m(self, bundle):
        for field_name, field_object in self.fields.items():
            if not getattr(field_object, 'is_m2m', False):
                continue

            if not field_object.attribute:
                continue

            if field_object.readonly:
                continue

            # Get the manager.
            related_mngr = getattr(bundle.obj, field_object.attribute)
                # This is code commented out from the original function
                # that would clear out the existing related "Person" objects
            if hasattr(related_mngr, 'clear'):
                #Clear it out, just to be safe.
                related_mngr.clear()

            related_objs = []

            for related_bundle in bundle.data[field_name]:
                # See if this person already exists in the database
                try:
                    question = Question.objects.get(id=related_bundle.obj.id)
                # If it doesn't exist, then save and use the object TastyPie
                # has already prepared for creation
                except Question.DoesNotExist:
                    question = related_bundle.obj
                    question.save()

                related_objs.append(question)

            related_mngr.add(*related_objs)




class BlockResource(SurveyModelResource):
    skip_question = fields.ToOneField('apps.survey.api.QuestionResource', 'skip_question', null=True, blank=True)

    class Meta:
        queryset = Block.objects.all()
        always_return_data = True
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()


class QuestionResource(SurveyModelResource):
    options = fields.ToManyField(OptionResource, 'options', full=True, null=True, blank=True)
    grid_cols = fields.ToManyField(OptionResource, 'grid_cols', full=True, null=True, blank=True)
    modalQuestion = fields.ToOneField('self', 'modalQuestion', full=True, null=True, blank=True)
    hoist_answers = fields.ToOneField('self', 'hoist_answers', full=True, null=True, blank=True)
    foreach_question = fields.ToOneField('self', 'foreach_question', full=True, null=True, blank=True)
    question_types = fields.DictField(attribute='question_types', readonly=True)
    report_types = fields.DictField(attribute='report_types', readonly=True)
    answer_domain = fields.ListField(attribute='answer_domain', readonly=True, null=True)
    filter_questions = fields.ToManyField('self', 'filter_questions', null=True, blank=True)
    skip_question = fields.ToOneField('self', 'skip_question', null=True, blank=True)
    blocks = fields.ToManyField('apps.survey.api.BlockResource', 'blocks', null=True, blank=True, full=True)
    # pages = fields.ToManyField('apps.survey.api.PageResource', 'page_set', null=True, blank=True)


    class Meta:
        queryset = Question.objects.all()
        always_return_data = True
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()
        filtering = {
            'slug': ALL,
            'surveys': ALL_WITH_RELATIONS
        }

class SurveyResource(SurveyModelResource):
    questions = fields.ToManyField(QuestionResource, 'questions', full=True, null=True, blank=True)
    question = fields.ToOneField(QuestionResource, 'question', full=True, null=True, blank=True)
    pages = fields.ToManyField(PageResource, 'page_set', full=True, null=True, blank=True)
    class Meta:
        queryset = Survey.objects.all()
        always_return_data = True
        authorization = StaffUserOnlyAuthorization()
        authentication = Authentication()
        filtering = {
            'slug': ['exact']
        }


    def save_m2m(self, bundle):
        pass


    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]

class SurveyReportResource(SurveyResource):
    questions = fields.ToManyField(QuestionResource, 'questions', null=True, blank=True)
    completes = fields.IntegerField(attribute='completes', readonly=True)
    survey_responses = fields.IntegerField(attribute='survey_responses', readonly=True)
    activity_points = fields.IntegerField(attribute='activity_points', readonly=True)
