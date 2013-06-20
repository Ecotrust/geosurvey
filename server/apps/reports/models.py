from django.db import models
from django.db.models import Avg, Max, Min, Count, Sum

import caching.base

from apps.survey.models import Survey, Question, Response, Respondant, Location

class QuestionReport(Question):

    class Meta:
        proxy = True

    def get_answer_domain(self, survey, filters=None):
        answers = self.response_set.filter(respondant__complete=True)
        if filters is not None:    
            for filter in filters:
                slug = filter.keys()[0]
                value = filter[slug]
                filter_question = QuestionReport.objects.get(slug=slug, survey=survey)
                answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
        print self.type        
        # locations = Location.objects.filter(response__respondant__responses__in=answers)
        # print answers.values('answer', 'respondant__responses__location').annotate(locations=Count('respondant__responses__location'))
        return answers.values('answer').annotate(locations=Sum('respondant__locations'), surveys=Count('answer'))
        
