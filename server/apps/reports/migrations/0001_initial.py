# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'CSVRow'
        db.create_table(u'reports_csvrow', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('json_data', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'reports', ['CSVRow'])


    def backwards(self, orm):
        # Deleting model 'CSVRow'
        db.delete_table(u'reports_csvrow')


    models = {
        u'reports.csvrow': {
            'Meta': {'object_name': 'CSVRow'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'json_data': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['reports']
