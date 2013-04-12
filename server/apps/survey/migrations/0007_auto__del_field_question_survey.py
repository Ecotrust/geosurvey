# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Question.survey'
        db.delete_column(u'survey_question', 'survey_id')

        # Adding M2M table for field questions on 'Survey'
        db.create_table(u'survey_survey_questions', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('survey', models.ForeignKey(orm[u'survey.survey'], null=False)),
            ('question', models.ForeignKey(orm[u'survey.question'], null=False))
        ))
        db.create_unique(u'survey_survey_questions', ['survey_id', 'question_id'])


    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'Question.survey'
        raise RuntimeError("Cannot reverse this migration. 'Question.survey' and its values cannot be restored.")
        # Removing M2M table for field questions on 'Survey'
        db.delete_table('survey_survey_questions')


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
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['survey.Option']", 'null': 'True', 'symmetrical': 'False'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '64'}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '20'})
        },
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'questions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['survey.Question']", 'null': 'True', 'symmetrical': 'False'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'})
        }
    }

    complete_apps = ['survey']