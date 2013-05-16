from django.db import models
from django.db.models import Avg, Max, Min, Count

import caching.base

from apps.survey.models import Survey, Question, Response, Respondant

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

    def get_answer_domain(self, filter_question=None, filter_value=None):
        answers = self.response_set.all()

        if filter_question is not None and filter_value is not None:
            answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer=filter_value)).values('answer').annotate(count=Count('answer'))
        return answers.values('answer').annotate(count=Count('answer'))
