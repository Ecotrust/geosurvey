# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Respondant'
        db.create_table(u'tracker_respondant', (
            ('ts', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime(2013, 4, 11, 0, 0))),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=254)),
            ('uuid', self.gf('django.db.models.fields.CharField')(default='c961bcfc-f721-41cf-87b0-58dd35a0dbe0', max_length=36, primary_key=True)),
        ))
        db.send_create_signal(u'tracker', ['Respondant'])


    def backwards(self, orm):
        # Deleting model 'Respondant'
        db.delete_table(u'tracker_respondant')


    models = {
        u'tracker.respondant': {
            'Meta': {'object_name': 'Respondant'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '254'}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 4, 11, 0, 0)'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'6bbe4939-69d5-4e14-bb2a-4c8c335f5bd9'", 'max_length': '36', 'primary_key': 'True'})
        }
    }

    complete_apps = ['tracker']