# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Question.options_json'
        db.add_column(u'survey_question', 'options_json',
                      self.gf('django.db.models.fields.CharField')(max_length=254, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Question.options_json'
        db.delete_column(u'survey_question', 'options_json')


    models = {
        u'survey.option': {
            'Meta': {'object_name': 'Option'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '254'})
        },
        u'survey.question': {
            'Meta': {'object_name': 'Question'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Option']", 'null': 'True', 'blank': 'True'}),
            'options_json': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '20'})
        },
        u'survey.respondant': {
            'Meta': {'object_name': 'Respondant'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '254'}),
            'responses': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'responses'", 'symmetrical': 'False', 'to': u"orm['survey.Response']"}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 4, 17, 0, 0)'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'1af663ed-c784-4bdf-9d50-6c062f3bf5d8'", 'max_length': '36', 'primary_key': 'True'})
        },
        u'survey.response': {
            'Meta': {'object_name': 'Response'},
            'answer': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 4, 17, 0, 0)'})
        },
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'questions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Question']", 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'})
        }
    }

    complete_apps = ['survey']