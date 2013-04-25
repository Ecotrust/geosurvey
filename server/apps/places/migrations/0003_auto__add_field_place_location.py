# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Place.location'
        db.add_column(u'places_place', 'location',
                      self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Place.location'
        db.delete_column(u'places_place', 'location')


    models = {
        u'places.place': {
            'Meta': {'object_name': 'Place'},
            'county': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'location': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
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