from django.contrib.auth.models import User
from django.db import models
from django.db.models import Max, Min, Count, Sum
from django.db.models import signals
from django.utils.timezone import utc

import datetime
import uuid
import simplejson
import caching.base

from ordereddict import OrderedDict


def make_uuid():
    return str(uuid.uuid4())

STATE_CHOICES = (
    ('complete', 'Complete'),
    ('terminate', 'Terminate'),

)
class Respondant(caching.base.CachingMixin, models.Model):
    uuid = models.CharField(max_length=36, primary_key=True, default=make_uuid, editable=False)
    survey = models.ForeignKey('Survey')
    responses = models.ManyToManyField('Response', related_name='responses', null=True, blank=True)
    complete = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATE_CHOICES, default=None, null=True, blank=True)
    last_question = models.CharField(max_length=240, null=True, blank=True)

    county = models.CharField(max_length=240, null=True, blank=True)
    state = models.CharField(max_length=240, null=True, blank=True)
    locations = models.IntegerField(null=True, blank=True)

    ts = models.DateTimeField(default=datetime.datetime.now())
    email = models.EmailField(max_length=254, null=True, blank=True, default=None)

    csv_row = models.ForeignKey('reports.CSVRow', null=True, blank=True)

    objects = caching.base.CachingManager()

    def __str__(self):
        if self.email:
            return "%s" % self.email
        else:
            return "%s" % self.uuid

    def save(self, *args, **kwargs):
        if self.uuid and ":" in self.uuid:
            self.uuid = self.uuid.replace(":", "_")
        if not self.ts:
            self.ts = datetime.datetime.utcnow().replace(tzinfo=utc)
        self.locations = self.location_set.all().count()

        if not self.csv_row:
            # Circular import dodging
            from apps.reports.models import CSVRow
            self.csv_row = CSVRow.objects.create()
        super(Respondant, self).save(*args, **kwargs)
        # Do this after saving so save_related is called to catch
        # all the updated responses.
        self.update_csv_row()

    def update_csv_row(self):
        self.csv_row.json_data = simplejson.dumps(self.generate_flat_dict())
        self.csv_row.save()

    @classmethod
    def get_field_names(cls):
        return OrderedDict((
            ('model-uuid', 'UUID'),
            ('model-timestamp', 'Date of survey'),
            ('model-email', 'Email'),
            ('model-complete', 'Complete'),
        ))

    def generate_flat_dict(self):
        flat = {
            'model-uuid': self.uuid,
            'model-timestamp': str(self.ts),
            'model-email': self.email,
            'model-complete': self.complete,
        }

        for response in self.response_set.all().select_related('question'):
            flat.update(response.generate_flat_dict())
        return flat

    @classmethod
    def stats_report_filter(cls, survey_slug, start_date=None,
                            end_date=None):

        qs = cls.objects.filter(survey__slug=survey_slug)

        if start_date is not None:
            qs = qs.filter(ts__gte=start_date)

        if end_date is not None:
            qs = qs.filter(ts__lt=end_date)

        return qs


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
    def num_registered(self):
        return self.respondant_set.all().count()

    @property
    def num_no_starts(self):
        return self.respondant_set.filter(responses=None).count()

    @property
    def completes(self):
        return self.respondant_set.filter(complete=True).count()

    @property
    def num_partials(self):
        return self.num_registered - self.completes - self.num_no_starts

    @property
    def activity_points(self):
        return Location.objects.filter(response__respondant__in=self.respondant_set.filter(complete=True)).count()

    @property
    def common_last_questions(self):
        # On July 18, 2013 we started recording info pages as last questions. To show 
        # clear values for this property, we only get a tally of the last_questions 
        # answered after the switch. -- Tim Glaser
        info_pages_date = datetime.datetime(2013, 7, 18)
        all_partials = self.respondant_set.exclude(last_question__isnull=True).exclude(last_question='feedback').exclude(complete=True)
        
        # Get a list of only respondants that submitted their last question after the info_pages_date.
        respondants_list = []
        for respondant in all_partials:
            last_responses = respondant.responses.filter(question__slug=respondant.last_question, ts__gt=info_pages_date)
            # there should either be one or zero (zero if last response was prior to info_pages_date)
            if (len(last_responses) == 1): 
                respondants_list.append(respondant.pk)
        
        partials_after_date = all_partials.filter(pk__in=respondants_list)
        total_exits = len(partials_after_date)

        groups = partials_after_date.values('last_question').annotate(num_exits=Count("uuid")).order_by('-num_exits')[:10]
        for group in groups:
            group['percent_exits'] = float(group['num_exits']) / float(total_exits)

        return groups


    @property
    def completes_per_state(self):
        return self.respondant_set.filter(complete=True).values("state").annotate(num_respondants=Count("uuid")).order_by('-num_respondants')


    def generate_field_names(self):
        fields = OrderedDict()
        for qu in self.questions.all().order_by('order'):
            if qu.type == 'grid':
                if hasattr(qu, 'rows'):
                    for row in qu.rows.splitlines():
                        row_slug = (row.lower().replace(' ', '-')
                                               .replace('(', '')
                                               .replace(')', '')
                                               .replace('/', ''))
                        field_slug = qu.slug + '-' + row_slug
                        field_name = qu.label + ' - ' + row
                        fields[field_slug] = field_name
                else:
                    rows = (qu.response_set
                             .exclude(gridanswer__row_label__isnull=True)
                             .values_list('gridanswer__row_label',
                                          'gridanswer__row_text')
                             .distinct())
                    for slug, text in rows:
                        fields[qu.slug + '-' + slug] = qu.label + ' - ' + text
            elif qu.type == 'map-multipoint':
                a = 0
                #locations = (qu.response_set.all().values_list('location__lat','location__lng').distinct())
                #for lat, lng in locations:
                #    fields[qu.slug + '-('+str(lat)+','+ str(lng) +')'] = qu.label + '-('+str(lat)+','+ str(lng) +')'
            else:
                fields[qu.slug] = qu.label

        return fields

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
        ('heatmap-distribution', 'Heatmap & Distribution'),
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
    filter_questions = models.ManyToManyField('self', null=True, blank=True)


    @property
    def answer_domain(self):
        if self.visualize or self.filterBy:
            answers = self.response_set.filter(respondant__complete=True)
            if self.type in ['map-multipoint']:
                return LocationAnswer.objects.filter(location__response__in=answers).values('answer').annotate(locations=Count('answer'), surveys=Count('location__respondant', distinct=True))
            else:
                return answers.values('answer').annotate(locations=Sum('respondant__locations'), surveys=Count('answer'))
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

    def get_answer_domain(self, survey, filters=None):
        answers = self.response_set.filter(respondant__complete=True)
        if self.type in ['map-multipoint']:
            locations = LocationAnswer.objects.filter(location__response__in=answers)
        if filters is not None:
            for filter in filters:
                slug = filter.keys()[0]
                value = filter[slug]
                filter_question = Question.objects.get(slug=slug, survey=survey)

                if self.type in ['map-multipoint']:
                    if filter_question == self:
                        locations = locations.filter(answer__in=value)
                    else:
                        answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
                        locations = locations.filter(location__response__in=answers)
                else:
                    if filter_question.type in ['map-multipoint']:
                        answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(location__locationanswer__answer__in=value))
                    else:
                        answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
        if self.type in ['map-multipoint']:
            return locations.values('answer').annotate(locations=Count('answer'), surveys=Count('location__respondant', distinct=True))
        else:
            return answers.values('answer').annotate(locations=Sum('respondant__locations'), surveys=Count('answer'))
        
        # answers = self.response_set.all() #.filter(respondant__complete=True) # self.response_set.all()  
        # if self.type in ['map-multipoint']:
        #     locations = LocationAnswer.objects.filter(location__response__in=answers)
        # if filters is not None:
        #     for filter in filters:
        #         slug = filter.keys()[0]
        #         value = filter[slug]
        #         filter_question = Question.objects.get(slug=slug, survey=survey)

        #         if self.type in ['map-multipoint']:
        #             if filter_question == self:
        #                 locations = locations.filter(answer__in=value)
        #             else:
        #                 answers = answers.filter(respondant__response_set__in=filter_question.response_set.filter(answer__in=value))
        #                 locations = locations.filter(location__response__in=answers)
        #         else:
        #             answers = answers.filter(respondant__responses__in=filter_question.response_set.filter(answer__in=value))
        # if self.type in ['map-multipoint']:
        #     return locations.values('answer').annotate(locations=Count('answer'), surveys=Count('location__respondant', distinct=True))
        # elif self.type in ['multi-select']:
        #     return (MultiAnswer.objects.filter(response__in=answers)
        #                                .values('answer_text')
        #                                .annotate(surveys=Count('answer_text')))
        # else:
        #     return (answers.values('answer')
        #                    .annotate(locations=Sum('respondant__locations'), surveys=Count('answer')))

    def __str__(self):
        return "%s/%s/%s (%d)" % (self.survey_slug, self.title, self.type, self.order)
        #return "%s/%s" % (self.survey_set.all()[0].slug, self.label)

class LocationAnswer(caching.base.CachingMixin, models.Model):
    answer = models.TextField(null=True, blank=True, default=None)
    label = models.TextField(null=True, blank=True, default=None)
    location = models.ForeignKey('Location')
    geojson = models.TextField(null=True, blank=True, default=None)
    
    def __str__(self):
        return "%s/%s" % (self.location.response.respondant.uuid, self.answer)

    def save(self, *args, **kwargs):
        d = {
            'type': "Feature",
            'properties': {
                'activity': self.answer,
                'label': self.label
            },
            'geometry': {
                'type': "Point",
                'coordinates': [self.location.lng, self.location.lat]
            }
        }
        self.geojson = simplejson.dumps(d)
        super(LocationAnswer, self).save(*args, **kwargs)

class Location(caching.base.CachingMixin, models.Model):
    response = models.ForeignKey('Response')
    respondant = models.ForeignKey('Respondant', null=True, blank=True)
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    lng = models.DecimalField(max_digits=10, decimal_places=7)

    def __str__(self):
        return "%s/%s/%s" % (self.response.respondant.survey.slug, self.response.question.slug, self.response.respondant.uuid)


class MultiAnswer(caching.base.CachingMixin, models.Model):
    response = models.ForeignKey('Response')
    answer_text = models.TextField()
    answer_label = models.TextField(null=True, blank=True)


class GridAnswer(caching.base.CachingMixin, models.Model):
    response = models.ForeignKey('Response')
    row_text = models.TextField(null=True, blank=True)
    row_label = models.TextField(null=True, blank=True)
    col_text = models.TextField(null=True, blank=True)
    col_label = models.TextField(null=True, blank=True)
    answer_text = models.TextField(null=True, blank=True)
    answer_number = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return "%s: %s" % (self.row_text, self.col_text)


class Response(caching.base.CachingMixin, models.Model):
    question = models.ForeignKey(Question)
    respondant = models.ForeignKey(Respondant)
    answer = models.TextField()
    answer_number = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    answer_raw = models.TextField()
    user_agent = models.TextField(default='')
    ts = models.DateTimeField(default=datetime.datetime.now())
    objects = caching.base.CachingManager()

    def save(self, *args, **kwargs):
        if not self.ts:
            self.ts = datetime.datetime.utcnow().replace(tzinfo=utc)
        super(Response, self).save(*args, **kwargs)

    def generate_flat_dict(self):
        flat = {}
        if self.answer_raw:
            if self.question.type in ('info', 'text', 'textarea', 'yes-no',
                                      'single-select', 'auto-single-select',
                                      'timepicker', 'multi-select'):
                flat[self.question.slug] = self.answer
            elif self.question.type in ('currency', 'integer', 'number'):
                flat[self.question.slug] = self.answer
            elif self.question.type == 'datepicker':
                flat[self.question.slug] = self.answer_date.strftime('%d/%m/%Y')
            elif self.question.type == 'grid':
                for answer in self.gridanswer_set.all():
                    flat[self.question.slug + '-' + answer.row_label] = answer.answer_text
            elif self.question.type == 'map-multipoint':
                a = 0
                # for location in self.location_set.all():
                #     locationAnswers = LocationAnswer.objects.filter(location__exact=location)
                #     for locationAnswer in locationAnswers: 
                #         flat[self.question.slug + '-(' + str(location.lat) + ',' + str(location.lng) +')'] = locationAnswer.answer
            else:
                raise NotImplementedError(
                    ('Found unknown question type of {0} while processing '
                     'response id {1}').format(self.question.type, self.id)
                )
            return flat

    def save_related(self):
        if self.answer_raw:
            self.answer = simplejson.loads(self.answer_raw)
            if self.question.type in ['datepicker']:
                self.answer_date = datetime.datetime.strptime(self.answer, '%d/%m/%Y')
            elif self.question.type in ['currency', 'integer', 'number']:
                if isinstance(self.answer, (int, long, float, complex)):
                    self.answer_number = self.answer
                else:
                    self.answer = None
            elif self.question.type in ['auto-single-select', 'single-select', 'yes-no']:

                answer = simplejson.loads(self.answer_raw)
                if answer.get('name'):
                    self.answer = answer['name'].strip()
                elif answer.get('text'):
                    self.answer = answer['text'].strip()
            elif self.question.type in ['auto-multi-select', 'multi-select']:
                answers = []
                self.multianswer_set.all().delete()
                for answer in simplejson.loads(self.answer_raw):
                    if answer.get('name'):
                        answer_text = answer['name'].strip()
                    elif answer.get('text'):
                        answer_text = answer['text'].strip()
                    answers.append(answer_text)
                    answer_label = answer.get('label', None)
                    multi_answer = MultiAnswer(response=self, answer_text=answer_text, answer_label=answer_label)
                    multi_answer.save()
                self.answer = ", ".join(answers)
            elif self.question.type in ['map-multipoint'] and self.id:
                answers = []
                self.location_set.all().delete()
                for point in simplejson.loads(simplejson.loads(self.answer_raw)):
                        answers.append("%s,%s: %s" % (point['lat'], point['lng'], point['answers']))
                        location = Location(lat=point['lat'], lng=point['lng'], response=self, respondant=self.respondant)
                        location.save()
                        for answer in point['answers']:
                            answer = LocationAnswer(answer=answer['text'], label=answer['label'], location=location)
                            answer.save()
                        location.save()
                self.answer = ", ".join(answers)
            elif self.question.type == 'grid':
                self.gridanswer_set.all().delete()
                for answer in self.answer:
                    for grid_col in self.question.grid_cols.all():
                        if grid_col.type in ['currency', 'integer', 'number', 'single-select', 'text', 'yes-no']:
                            try:
                                grid_answer = GridAnswer(response=self,
                                    answer_text=answer[grid_col.label.replace('-', '')],
                                    answer_number=answer[grid_col.label.replace('-', '')],
                                    row_label=answer['label'], row_text=answer['text'],
                                    col_label=grid_col.label, col_text=grid_col.text)
                                grid_answer.save()
                            except Exception as e:
                                print "problem with %s in response id %s" % (grid_col.label, self.id)
                                print "not found in", self.answer_raw
                                print e

                        elif grid_col.type == 'multi-select':
                            try:
                                for this_answer in answer[grid_col.label.replace('-', '')]:
                                    print this_answer
                                    grid_answer = GridAnswer(response=self,
                                        answer_text=this_answer,
                                        row_label=answer['label'], row_text=answer['text'],
                                        col_label=grid_col.label, col_text=grid_col.text)
                                    grid_answer.save()
                            except:
                                print "problem with ", answer
                                print e
                        else:
                            print grid_col.type
                            print answer
            question_slug = self.question.slug.replace('-', '_')
            if hasattr(self.respondant, question_slug):
                # Switched to filter and update rather than just modifying and
                # saving. This doesn't trigger post_save, but still updates
                # self.respondant and the related CSVRow object.
                (Respondant.objects.filter(pk=self.respondant.pk)
                                   .update(**{question_slug: self.answer}))
                setattr(self.respondant, question_slug, self.answer)
                self.respondant.save()
                self.respondant.update_csv_row()
            self.save()

    def __str__(self):
        return "%s/%s/%s" % (self.respondant.email, self.question.survey_slug, self.question.slug)            
    # def __unicode__(self):
    #     if self.respondant and self.question:
    #         return "%s/%s (%s)" % (self.respondant.survey.slug, self.question.slug, self.respondant.uuid)
    #     else:
    #         return "No Respondant"


    # def save(self, *args, **kwargs):
    #     ''' On save, update timestamps '''
    #     if not self.id:
    #         self.ts = datetime.datetime.now()
    #     else:
    #         self.answer = simplejson.loads(self.answer_raw)
    #         if self.question.type in ['auto-single-select', 'single-select']:
    #             answer = simplejson.loads(self.answer_raw)
    #             if answer.get('text'):
    #                 self.answer = answer['text']
    #             if answer.get('name'):
    #                 self.answer = answer['name']
    #             #self.answer = self.answer_raw['name']
    #         if self.question.type in ['auto-multi-select', 'multi-select']:
    #             answers = []
    #             self.multianswer_set.all().delete()
    #             for answer in simplejson.loads(self.answer_raw):
    #                 if answer.get('text'):
    #                     answer_text = answer['text']
    #                 if answer.get('name'):
    #                     answer_text = answer['name']
    #                 answers.append(answer_text)
    #                 answer_label = answer.get('label', None)
    #                 multi_answer = MultiAnswer(response=self, answer_text=answer_text, answer_label=answer_label)
    #                 multi_answer.save()
    #             self.answer = ", ".join(answers)
    #         if self.question.type in ['map-multipoint'] and self.id:
    #             answers = []
    #             self.location_set.all().delete()
    #             for point in simplejson.loads(simplejson.loads(self.answer_raw)):
    #                     answers.append("%s,%s: %s" % (point['lat'], point['lng'] , point['answers']))
    #                     location = Location(lat=point['lat'], lng=point['lng'], response=self, respondant=self.respondant)
    #                     location.save()
    #                     for answer in point['answers']:
    #                         answer = LocationAnswer(answer=answer['text'], label=answer['label'], location=location)
    #                         answer.save()
    #                     location.save()
    #             self.answer = ", ".join(answers)
    #     if hasattr(self.respondant, self.question.slug):
    #         setattr(self.respondant, self.question.slug, self.answer)
    #         self.respondant.save()
    #     super(Response, self).save(*args, **kwargs)


class UsageTopic(caching.base.CachingMixin, models.Model):
    survey = models.ForeignKey('Survey')
    question = models.ForeignKey('Question')
    slug = models.SlugField(max_length=254, unique=True)
    entries = models.ManyToManyField('UsageEntry', related_name='entries', null=True, blank=True)
    objects = caching.base.CachingManager()

    def __str__(self):
        return "%s/%s/%s" % (self.survey.slug, self.question.slug, self.slug)


class UsageEntry(caching.base.CachingMixin, models.Model):
    topic = models.ForeignKey('UsageTopic')
    respondant = models.ForeignKey('Respondant')
    data = models.CharField(max_length=240, null=True, blank=True)
    ts = models.DateTimeField(default=datetime.datetime.now())
    objects = caching.base.CachingManager()

    def __str__(self):
        return "%s/%s" % (str(self.topic), self.respondant.uuid)



def save_related(sender, instance, created, **kwargs):
    # save the related objects on initial creation
    if created:
        instance.save_related()

signals.post_save.connect(save_related, sender=Response)