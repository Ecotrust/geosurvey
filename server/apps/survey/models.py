from django.db import models
from django.db.models import Avg, Max, Min, Count

import datetime
import uuid
import simplejson
import caching.base
import ast
def make_uuid():
    return str(uuid.uuid4())


class Respondant(caching.base.CachingMixin, models.Model):
    uuid = models.CharField(max_length=36, primary_key=True, default=make_uuid, editable=False)
    survey = models.ForeignKey('Survey')
    responses = models.ManyToManyField('Response', related_name='responses', null=True, blank=True)
    complete = models.BooleanField(default=False)

    ts = models.DateTimeField(default=datetime.datetime.now())
    email = models.EmailField(max_length=254, null=True, blank=True, default=None)
    objects = caching.base.CachingManager()



    def __str__(self):
        return "%s" % self.email

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.uuid:
            self.ts = datetime.datetime.now()
        super(Respondant, self).save(*args, **kwargs)


class Page(caching.base.CachingMixin, models.Model):
    question = models.ForeignKey('Question')
    survey = models.ForeignKey('Survey')
    objects = caching.base.CachingManager()

    def __str__(self):
        return "%s/%s (%d)" % (self.survey.name, self.question.slug, self.question.order)

    class Meta:
        ordering = ['survey', 'question__order']


class Survey(caching.base.CachingMixin, models.Model):
    name = models.CharField(max_length=254)
    slug = models.SlugField(max_length=254, unique=True)
    questions = models.ManyToManyField('Question', null=True, blank=True, through="Page")
    states = models.CharField(max_length=200, null=True, blank=True)
    anon = models.BooleanField(default=True)

    objects = caching.base.CachingManager()

    @property
    def survey_responses(self):
        return self.respondant_set.all().count()

    @property
    def completes(self):
        return self.respondant_set.filter(complete=True).count()

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

class Option(caching.base.CachingMixin, models.Model):
    text = models.CharField(max_length=254)
    label = models.SlugField(max_length=64) 
    objects = caching.base.CachingManager()

    def __str__(self):
        return "%s" % self.text

REPORT_TYPE_CHOICES = (
        ('distribution', 'Distribution'),
        ('heatmap', 'Heatmap'),
    )

class Question(caching.base.CachingMixin, models.Model):
    title = models.TextField()
    label = models.CharField(max_length=254)
    order = models.IntegerField(default=0)
    slug = models.SlugField(max_length=64)
    type = models.CharField(max_length=20,choices=QUESTION_TYPE_CHOICES,default='text')
    options = models.ManyToManyField(Option, null=True, blank=True)
    options_json = models.CharField(max_length=254, null=True, blank=True)
    info = models.CharField(max_length=254, null=True, blank=True);1

    zoom = models.IntegerField(null=True, blank=True)
    min_zoom = models.IntegerField(null=True, blank=True, default=10)
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    integer_min = models.IntegerField(default=0, null=True, blank=True)
    integer_max = models.IntegerField(default=365, null=True, blank=True)
    term_condition = models.CharField(max_length=254, null=True, blank=True)

    randomize_groups = models.BooleanField(default=False)
    options_from_previous_answer = models.CharField(max_length=254, null=True, blank=True)
    allow_other = models.BooleanField(default=False)
    required = models.BooleanField(default=True)
    modalQuestion = models.ForeignKey('self', null=True, blank=True, related_name="modal_question")
    hoist_answers = models.ForeignKey('self', null=True, blank=True, related_name="hoisted")


    # backend stuff
    filterBy = models.BooleanField(default=False)
    visualize = models.BooleanField(default=False)
    report_type = models.CharField(max_length=20,choices=REPORT_TYPE_CHOICES,null=True, default=None)


    @property
    def answer_domain(self):
        if self.visualize or self.filterBy:
            return self.response_set.all().order_by('answer').values('answer').annotate(count=Count('answer')).order_by('-count')
        else:
            return None

    objects = caching.base.CachingManager()


    class Meta:
        ordering = ['order']

    @property
    def survey_slug(self):
        if self.survey_set.all():
            return self.survey_set.all()[0].slug
        elif self.modal_question.all():
            return self.modal_question.all()[0].survey_set.all()[0].slug + " (modal)"
        else:
            return "NA"

    @property
    def question_types(self):
        return QUESTION_TYPE_CHOICES

    @property
    def report_types(self):
        return REPORT_TYPE_CHOICES

    def __str__(self):
        return "%s/%s/%s (%d)" % (self.survey_slug, self.title, self.type, self.order)
        #return "%s/%s" % (self.survey_set.all()[0].slug, self.label)

class Location(caching.base.CachingMixin, models.Model):
    answer = models.TextField()
    response = models.ForeignKey('Response')
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    lng = models.DecimalField(max_digits=10, decimal_places=7)

class Response(caching.base.CachingMixin, models.Model):
    question = models.ForeignKey(Question)
    respondant = models.ForeignKey(Respondant)
    answer = models.TextField()
    answer_raw = models.TextField()
    ts = models.DateTimeField(default=datetime.datetime.now())
    objects = caching.base.CachingManager()


    def __str__(self):
        return "%s/%s/%s" % (self.respondant.email, self.question.survey_slug, self.question.slug)

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        if not self.id:
            self.ts = datetime.datetime.now()
        else:
            self.answer = simplejson.loads(self.answer_raw)
            if self.question.type in ['auto-single-select', 'single-select']:
                answer = simplejson.loads(self.answer_raw)
                print answer
                if answer.get('text'):
                    self.answer = answer['text']
                if answer.get('name'):
                    self.answer = answer['name']
                #self.answer = self.answer_raw['name']
            if self.question.type in ['auto-multi-select', 'multi-select']:
                answers = []
                for answer in simplejson.loads(self.answer_raw):
                    if answer.get('text'):
                        answers.append(answer['text'])
                    if answer.get('name'):
                        answers.append(answer['name'])
                self.answer = ", ".join(answers)
            if self.question.type in ['map-multipoint'] and self.id:
                answers = []
                for point in simplejson.loads(self.answer_raw):
                    for answer in point['answers']:
                        answers.append("%s,%s: %s" % (point['lat'], point['lng'] , answer['text']))
                        #location = Location(answer=answer['text'], lat=point['lat'], lng=point['lng'], response=self)
                        #location.save()
                self.answer = ", ".join(answers)
        print self.answer
        super(Response, self).save(*args, **kwargs)
