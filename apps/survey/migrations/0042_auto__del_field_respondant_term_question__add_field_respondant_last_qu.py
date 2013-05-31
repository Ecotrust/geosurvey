# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Respondant.term_question'
        db.delete_column(u'survey_respondant', 'term_question')

        # Adding field 'Respondant.last_question'
        db.add_column(u'survey_respondant', 'last_question',
                      self.gf('django.db.models.fields.CharField')(max_length=240, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Respondant.term_question'
        db.add_column(u'survey_respondant', 'term_question',
                      self.gf('django.db.models.fields.CharField')(max_length=240, null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Respondant.last_question'
        db.delete_column(u'survey_respondant', 'last_question')


    models = {
        u'survey.location': {
            'Meta': {'object_name': 'Location'},
            'answer': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '7'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '7'}),
            'response': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Response']"})
        },
        u'survey.option': {
            'Meta': {'object_name': 'Option'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '254'})
        },
        u'survey.page': {
            'Meta': {'ordering': "['survey', 'question__order']", 'object_name': 'Page'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"})
        },
        u'survey.question': {
            'Meta': {'ordering': "['order']", 'object_name': 'Question'},
            'allow_other': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'filterBy': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'hoist_answers': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'hoisted'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'integer_max': ('django.db.models.fields.IntegerField', [], {'default': '365', 'null': 'True', 'blank': 'True'}),
            'integer_min': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'min_zoom': ('django.db.models.fields.IntegerField', [], {'default': '10', 'null': 'True', 'blank': 'True'}),
            'modalQuestion': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'modal_question'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Option']", 'null': 'True', 'blank': 'True'}),
            'options_from_previous_answer': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'options_json': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'randomize_groups': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'report_type': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True'}),
            'required': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'term_condition': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '20'}),
            'visualize': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'zoom': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'survey.respondant': {
            'Meta': {'object_name': 'Respondant'},
            'complete': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'email': ('django.db.models.fields.EmailField', [], {'default': 'None', 'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'last_question': ('django.db.models.fields.CharField', [], {'max_length': '240', 'null': 'True', 'blank': 'True'}),
            'responses': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'responses'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Response']"}),
            'state': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 5, 30, 0, 0)'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'5870a757-bf51-4026-a03f-81288389d23f'", 'max_length': '36', 'primary_key': 'True'})
        },
        u'survey.response': {
            'Meta': {'object_name': 'Response'},
            'answer': ('django.db.models.fields.TextField', [], {}),
            'answer_raw': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 5, 30, 0, 0)'})
        },
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            'anon': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'questions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Question']", 'null': 'True', 'through': u"orm['survey.Page']", 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'}),
            'states': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['survey']