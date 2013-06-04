from django.db import models
from django.db.models import Avg, Max, Min, Count

import caching.base

from apps.survey.models import Survey, Question, Response, Respondant, Location

# REPORT_TYPE_CHOICES = (
#     ('distribution', 'Distribution'),
#     ('heatmap', 'Heatmap'),
# )
# class QuestionReport(caching.base.CachingMixin, models.Model):
#     type = models.CharField(max_length=20,choices=REPORT_TYPE_CHOICES,default='text')
#     survey = models.ForeignKey(Survey)
#     question

class QuestionReport(Question):

    class Meta:
        proxy = True

    def get_answer_domain(self, survey, filters=None):
        answers = self.response_set.all()

        if filters is not None:    
            for filter in filters:
                slug = filter.keys()[0]
                value = filter[slug]
                filter_question = QuestionReport.objects.get(slug=slug, survey=survey)

                answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))

        if self.type == 'map-multipoint':
            answers = Location.objects.filter()
        else:
            answers = answers.values('answer').annotate(count=Count('answer'))
        return answers.values('answer').annotate(count=Count('answer'))
