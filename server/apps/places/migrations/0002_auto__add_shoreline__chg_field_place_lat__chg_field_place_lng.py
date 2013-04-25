# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ShoreLine'
        db.create_table(u'places_shoreline', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('s_scale', self.gf('django.db.models.fields.IntegerField')()),
            ('s_chart', self.gf('django.db.models.fields.CharField')(max_length=7)),
            ('s_datum', self.gf('django.db.models.fields.IntegerField')()),
            ('s_rev_date', self.gf('django.db.models.fields.CharField')(max_length=5)),
            ('s_source', self.gf('django.db.models.fields.IntegerField')()),
            ('s_arc_code', self.gf('django.db.models.fields.IntegerField')()),
            ('s_integrit', self.gf('django.db.models.fields.IntegerField')()),
            ('regions', self.gf('django.db.models.fields.CharField')(max_length=2)),
            ('geom', self.gf('django.contrib.gis.db.models.fields.MultiLineStringField')()),
        ))
        db.send_create_signal(u'places', ['ShoreLine'])


        # Changing field 'Place.lat'
        db.alter_column(u'places_place', 'lat', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=10, decimal_places=7))

        # Changing field 'Place.lng'
        db.alter_column(u'places_place', 'lng', self.gf('django.db.models.fields.DecimalField')(null=True, max_digits=10, decimal_places=7))

    def backwards(self, orm):
        # Deleting model 'ShoreLine'
        db.delete_table(u'places_shoreline')


        # Changing field 'Place.lat'
        db.alter_column(u'places_place', 'lat', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=10, decimal_places=7))

        # Changing field 'Place.lng'
        db.alter_column(u'places_place', 'lng', self.gf('django.db.models.fields.DecimalField')(default=0, max_digits=10, decimal_places=7))

    models = {
        u'places.place': {
            'Meta': {'object_name': 'Place'},
            'county': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '254'})
        },
        u'places.shoreline': {
            'Meta': {'object_name': 'ShoreLine'},
            'geom': ('django.contrib.gis.db.models.fields.MultiLineStringField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'regions': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            's_arc_code': ('django.db.models.fields.IntegerField', [], {}),
            's_chart': ('django.db.models.fields.CharField', [], {'max_length': '7'}),
            's_datum': ('django.db.models.fields.IntegerField', [], {}),
            's_integrit': ('django.db.models.fields.IntegerField', [], {}),
            's_rev_date': ('django.db.models.fields.CharField', [], {'max_length': '5'}),
            's_scale': ('django.db.models.fields.IntegerField', [], {}),
            's_source': ('django.db.models.fields.IntegerField', [], {})
        }
    }

    complete_apps = ['places']