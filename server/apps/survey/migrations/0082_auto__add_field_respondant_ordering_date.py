# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Respondant.ordering_date'
        db.add_column(u'survey_respondant', 'ordering_date',
                      self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Respondant.ordering_date'
        db.delete_column(u'survey_respondant', 'ordering_date')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'survey.block': {
            'Meta': {'object_name': 'Block'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'skip_condition': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'skip_question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']", 'null': 'True', 'blank': 'True'})
        },
        u'survey.gridanswer': {
            'Meta': {'object_name': 'GridAnswer'},
            'answer_number': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '2', 'blank': 'True'}),
            'answer_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'col_label': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'col_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'response': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Response']"}),
            'row_label': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'row_text': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'survey.location': {
            'Meta': {'object_name': 'Location'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '7'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'max_digits': '10', 'decimal_places': '7'}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']", 'null': 'True', 'blank': 'True'}),
            'response': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Response']"})
        },
        u'survey.locationanswer': {
            'Meta': {'object_name': 'LocationAnswer'},
            'answer': ('django.db.models.fields.TextField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.TextField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'location': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Location']"})
        },
        u'survey.multianswer': {
            'Meta': {'object_name': 'MultiAnswer'},
            'answer_label': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'answer_text': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'response': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Response']"})
        },
        u'survey.option': {
            'Meta': {'object_name': 'Option'},
            'either_or': ('django.db.models.fields.SlugField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'max': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'min': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'required': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'rows': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'integer'", 'max_length': '20'})
        },
        u'survey.page': {
            'Meta': {'ordering': "['order']", 'object_name': 'Page'},
            'blocks': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Block']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']", 'null': 'True', 'blank': 'True'}),
            'questions': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'question_page'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Question']"}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']", 'null': 'True', 'blank': 'True'})
        },
        u'survey.question': {
            'Meta': {'ordering': "['order']", 'object_name': 'Question'},
            'allow_other': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'attach_to_profile': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'blocks': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Block']", 'null': 'True', 'blank': 'True'}),
            'cols': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'filterBy': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'filter_questions': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'filter_questions_rel_+'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'foreach_question': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'foreach'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'geojson': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'grid_cols': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'grid_cols'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Option']"}),
            'hoist_answers': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'hoisted'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'integer_max': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'integer_min': ('django.db.models.fields.IntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'min_zoom': ('django.db.models.fields.IntegerField', [], {'default': '10', 'null': 'True', 'blank': 'True'}),
            'modalQuestion': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'modal_question'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Option']", 'null': 'True', 'blank': 'True'}),
            'options_from_previous_answer': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'options_json': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'persistent': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'pre_calculated': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'randomize_groups': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'report_type': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True'}),
            'required': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'rows': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'skip_condition': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'skip_question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']", 'null': 'True', 'blank': 'True'}),
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
            'county': ('django.db.models.fields.CharField', [], {'max_length': '240', 'null': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'default': 'None', 'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'last_question': ('django.db.models.fields.CharField', [], {'max_length': '240', 'null': 'True', 'blank': 'True'}),
            'locations': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'ordering_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'responses': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'responses'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Response']"}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '240', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2014, 1, 23, 0, 0)'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'5d9f1a13-d92b-403d-a9b0-ea769fbab88b'", 'max_length': '36', 'primary_key': 'True'})
        },
        u'survey.response': {
            'Meta': {'ordering': "['-ts']", 'object_name': 'Response'},
            'answer': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'answer_raw': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']", 'null': 'True', 'blank': 'True'}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2014, 1, 23, 0, 0)'}),
            'unit': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        u'survey.survey': {
            'Meta': {'object_name': 'Survey'},
            'anon': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'offline': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'questions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Question']", 'null': 'True', 'through': u"orm['survey.Page']", 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '254'}),
            'states': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['survey']