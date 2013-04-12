# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Option'
        db.create_table(u'survey_option', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('text', self.gf('django.db.models.fields.CharField')(max_length=254)),
        ))
        db.send_create_signal(u'survey', ['Option'])

        # Adding M2M table for field options on 'Question'
        db.create_table(u'survey_question_options', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('question', models.ForeignKey(orm[u'survey.question'], null=False)),
            ('option', models.ForeignKey(orm[u'survey.option'], null=False))
        ))
        db.create_unique(u'survey_question_options', ['question_id', 'option_id'])


        # Changing field 'Question.type'
        db.alter_column(u'survey_question', 'type', self.gf('django.db.models.fields.CharField')(max_length=20))

    def backwards(self, orm):
        # Deleting model 'Option'
        db.delete_table(u'survey_option')

        # Removing M2M table for field options on 'Question'
        db.delete_table('survey_question_options')


        # Changing field 'Question.type'
        db.alter_column(u'survey_question', 'type', self.gf('django.db.models.fields.CharField')(max_length=2))

    models = {
        u'survey.option': {
            'Meta': {'object_name': 'Option'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '254'})
        },
        u'survey.question': {
            'Meta': {'object_name': 'Question'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['survey.Option']", 'symmetrical': 'False'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '64'}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '20'})
        },
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'})
        }
    }

    complete_apps = ['survey']