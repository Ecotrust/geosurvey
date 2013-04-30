from django.db import models
import datetime

import datetime
import uuid


def make_uuid():
    return str(uuid.uuid4())


class Respondant(models.Model):
    uuid = models.CharField(max_length=36, primary_key=True, default=make_uuid, editable=False)
    survey = models.ForeignKey('Survey')
    responses = models.ManyToManyField('Response', related_name='responses')

    ts = models.DateTimeField(default=datetime.datetime.now())
    email = models.EmailField(max_length=254)

    def __str__(self):
        return "%s" % self.email



class Page(models.Model):
    question = models.ForeignKey('Question')
    survey = models.ForeignKey('Survey')
    
    def __str__(self):
        return "%s/%s (%d)" % (self.survey.name, self.question.slug, self.question.order)

    class Meta:
        ordering = ['survey', 'question__order']


class Survey(models.Model):
    name = models.CharField(max_length=254)
    slug = models.SlugField(max_length=254, unique=True)
    questions = models.ManyToManyField('Question', null=True, blank=True, through="Page")

    def __str__(self):
        return "%s" % self.name


QUESTION_TYPE_CHOICES = (
    ('info', 'Info Page'),
    ('datepicker', 'Date Picker'),
    ('grid', 'Grid'),
    ('pennies', 'Pennies'),
    ('text', 'Text'),
    ('textarea', 'Text Area'),
    ('single-select', 'Single Select'),
    ('multi-select', 'Multi Select'),
    ('location', 'Location'),
    ('integer', 'Integer'),
    ('auto-single-select', 'Single Select with Autocomplete'),
    ('map-multipoint', 'Map with Multiple Points'),
)

class Option(models.Model):
    text = models.CharField(max_length=254)
    label = models.SlugField(max_length=64) 
   
    def __str__(self):
        return "%s" % self.text

class Question(models.Model):
    title = models.TextField()
    label = models.CharField(max_length=254)
    order = models.IntegerField(default=0)
    slug = models.SlugField(max_length=64)
    type = models.CharField(max_length=20,choices=QUESTION_TYPE_CHOICES,default='text')
    options = models.ManyToManyField(Option, null=True, blank=True)
    options_json = models.CharField(max_length=254, null=True, blank=True)
    info = models.CharField(max_length=254, null=True, blank=True);

    randomize_groups = models.BooleanField(default=False)
    options_from_previous_answer = models.CharField(max_length=254, null=True, blank=True)
    allow_other = models.BooleanField(default=False)
    modalQuestion = models.ForeignKey('self', null=True, blank=True)

    class Meta:
        ordering = ['order']

    @property
    def survey_slug(self):
        try:
            return self.survey_set.all()[0].slug
        except:
            return "NA"

    def __str__(self):
        return "%s/%s/%s (%d)" % (self.survey_slug, self.title, self.type, self.order)
        #return "%s/%s" % (self.survey_set.all()[0].slug, self.label)

class Response(models.Model):
    question = models.ForeignKey(Question)
    respondant = models.ForeignKey(Respondant)
    answer = models.TextField() 
    ts = models.DateTimeField(default=datetime.datetime.now())


    def __str__(self):
        return "%s/%s/%s" % (self.respondant.email, self.question.survey_slug, self.question.slug)