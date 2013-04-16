from django.db import models
import datetime

from tracker.models import Respondant


class Survey(models.Model):
    name = models.CharField(max_length=254)
    slug = models.SlugField(max_length=254, unique=True)
    questions = models.ManyToManyField('Question', null=True, blank=True)

    def __str__(self):
        return "%s" % self.name


QUESTION_TYPE_CHOICES = (
    ('text', 'Text'),
    ('textarea', 'Text Area'),
    ('single-select', 'Single Select'),
    ('multi-select', 'Multi Select'),
    ('location', 'Location'),
    ('integer', 'Integer'),
    ('auto-single-select', 'Single Select with Autocomplete'),
)

class Option(models.Model):
    text = models.CharField(max_length=254)
    label = models.SlugField(max_length=64) 
   
    def __str__(self):
        return "%s" % self.text

class Question(models.Model):
    title = models.TextField()
    label = models.CharField(max_length=254)
    slug = models.SlugField(max_length=64)
    type = models.CharField(max_length=20,choices=QUESTION_TYPE_CHOICES,default='text')
    options = models.ManyToManyField(Option, null=True, blank=True)

    def __str__(self):
        return "%s" % self.label


class Response(models.Model):
    question = models.ForeignKey(Question)
    respondant = models.ForeignKey(Respondant)
    answer = models.TextField() 
    ts = models.DateTimeField(default=datetime.datetime.now())


    def __str__(self):
        return "%s/%s/%s" % (self.respondant.email, self.question.survey_set.all()[0].slug, self.question.slug)