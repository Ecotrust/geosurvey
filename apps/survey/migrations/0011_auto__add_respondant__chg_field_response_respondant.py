# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Respondant'
        db.create_table(u'survey_respondant', (
            ('uuid', self.gf('django.db.models.fields.CharField')(default='7161160d-6e22-40e8-8848-c68fb5201a1b', max_length=36, primary_key=True)),
            ('survey', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['survey.Survey'])),
            ('ts', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime(2013, 4, 15, 0, 0))),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=254)),
        ))
        db.send_create_signal(u'survey', ['Respondant'])

        # Adding M2M table for field responses on 'Respondant'
        db.create_table(u'survey_respondant_responses', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('respondant', models.ForeignKey(orm[u'survey.respondant'], null=False)),
            ('response', models.ForeignKey(orm[u'survey.response'], null=False))
        ))
        db.create_unique(u'survey_respondant_responses', ['respondant_id', 'response_id'])


        # Changing field 'Response.respondant'
        db.alter_column(u'survey_response', 'respondant_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['survey.Respondant']))

    def backwards(self, orm):
        # Deleting model 'Respondant'
        db.delete_table(u'survey_respondant')

        # Removing M2M table for field responses on 'Respondant'
        db.delete_table('survey_respondant_responses')


        # Changing field 'Response.respondant'
        db.alter_column(u'survey_response', 'respondant_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['tracker.Respondant']))

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
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Option']", 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'title': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '20'})
        },
        u'survey.respondant': {
            'Meta': {'object_name': 'Respondant'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '254'}),
            'responses': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'responses'", 'symmetrical': 'False', 'to': u"orm['survey.Response']"}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 4, 15, 0, 0)'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'4bb95732-00ef-47bd-af0c-79b3a7a33226'", 'max_length': '36', 'primary_key': 'True'})
        },
        u'survey.response': {
            'Meta': {'object_name': 'Response'},
            'answer': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 4, 15, 0, 0)'})
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