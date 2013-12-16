# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Survey.slug'
        db.alter_column(u'survey_survey', 'slug', self.gf('django.db.models.fields.SlugField')(unique=True, max_length=254))
        # Adding index on 'Survey', fields ['slug']
        db.create_index(u'survey_survey', ['slug'])


    def backwards(self, orm):
        # Removing index on 'Survey', fields ['slug']
        db.delete_index(u'survey_survey', ['slug'])


        # Changing field 'Survey.slug'
        db.alter_column(u'survey_survey', 'slug', self.gf('django.db.models.fields.CharField')(max_length=254, unique=True))

    models = {
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'})
        }
    }

    complete_apps = ['survey']