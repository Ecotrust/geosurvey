# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding M2M table for field grid_cols on 'Question'
        m2m_table_name = db.shorten_name(u'survey_question_grid_cols')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('question', models.ForeignKey(orm[u'survey.question'], null=False)),
            ('option', models.ForeignKey(orm[u'survey.option'], null=False))
        ))
        db.create_unique(m2m_table_name, ['question_id', 'option_id'])


        # Changing field 'Page.question'
        db.alter_column(u'survey_page', 'question_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['survey.Question'], null=True))

        # Changing field 'Page.survey'
        db.alter_column(u'survey_page', 'survey_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['survey.Survey'], null=True))

    def backwards(self, orm):
        
        # Removing M2M table for field grid_cols on 'Question'
        db.delete_table(db.shorten_name(u'survey_question_grid_cols'))


        # User chose to not deal with backwards NULL issues for 'Page.question'
        raise RuntimeError("Cannot reverse this migration. 'Page.question' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Page.survey'
        raise RuntimeError("Cannot reverse this migration. 'Page.survey' and its values cannot be restored.")

    models = {
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
        u'survey.option': {
            'Meta': {'object_name': 'Option'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.SlugField', [], {'max_length': '64'}),
            'text': ('django.db.models.fields.CharField', [], {'max_length': '254'})
        },
        u'survey.page': {
            'Meta': {'ordering': "['survey', 'question__order']", 'object_name': 'Page'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']", 'null': 'True', 'blank': 'True'}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']", 'null': 'True', 'blank': 'True'})
        },
        u'survey.question': {
            'Meta': {'ordering': "['order']", 'object_name': 'Question'},
            'allow_other': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'filterBy': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'filter_questions': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'filter_questions_rel_+'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'foreach_question': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'foreach'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'grid_cols': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'grid_cols'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Option']"}),
            'hoist_answers': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'hoisted'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'integer_max': ('django.db.models.fields.IntegerField', [], {'default': '365', 'null': 'True', 'blank': 'True'}),
            'integer_min': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '254'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'lng': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '10', 'decimal_places': '7', 'blank': 'True'}),
            'min_zoom': ('django.db.models.fields.IntegerField', [], {'default': '10', 'null': 'True', 'blank': 'True'}),
            'modalQuestion': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'modal_question'", 'null': 'True', 'to': u"orm['survey.Question']"}),
            'options': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['survey.Option']", 'null': 'True', 'blank': 'True'}),
            'options_from_previous_answer': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'options_json': ('django.db.models.fields.CharField', [], {'max_length': '254', 'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'randomize_groups': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'report_type': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True'}),
            'required': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
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
            'responses': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'responses'", 'null': 'True', 'symmetrical': 'False', 'to': u"orm['survey.Response']"}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '240', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': 'None', 'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'survey': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Survey']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 6, 20, 0, 0)'}),
            'uuid': ('django.db.models.fields.CharField', [], {'default': "'5a239a9d-1a8b-49e5-89e0-01303a62a553'", 'max_length': '36', 'primary_key': 'True'})
        },
        u'survey.response': {
            'Meta': {'object_name': 'Response'},
            'answer': ('django.db.models.fields.TextField', [], {}),
            'answer_raw': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'question': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Question']"}),
            'respondant': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['survey.Respondant']"}),
            'ts': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 6, 20, 0, 0)'})
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