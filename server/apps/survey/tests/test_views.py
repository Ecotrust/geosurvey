import datetime
import json

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.test import TestCase
from tastypie.test import ResourceTestCase

from ..models import Respondant, Response, Survey


class TestAnswer(ResourceTestCase):
    fixtures = ['surveys.json.gz']

    def setUp(self):
        self.survey = Survey.objects.get(slug='catch-report')
        self.question = self.survey.questions.get(slug='island')
        self.respondant_user = User.objects.create(username='respondant_user',
                                                   email='respondant_user@example.com',
                                                   password=make_password(
                                                       'pass'),
                                                   is_staff=True)
        self.respondant = Respondant(survey=self.survey,
                                     ts=datetime.datetime.now(),
                                     user=self.respondant_user)
        response = Response(question=self.question,
                            respondant=self.respondant)
        response.answer_raw = json.dumps({'text': 'St. John'})
        self.respondant.save()
        response.save()

    def get_url(self):
        return reverse('survey_answer', kwargs={
            'survey_slug': self.survey.slug,
            'question_slug': self.question.slug,
            'uuid': self.respondant.uuid
        })

    def test_get(self):
        res = self.client.get(self.get_url())
        self.assertEqual(res.status_code, 200)

    def test_edit_with_same_user(self):
        self.client.login(username='respondant_user', password='pass')
        res = self.client.post(self.get_url(), data={
            json.dumps({
                'answer': {
                    'text': 'Ball Beach'
                }
            }): None
        })
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.content)
        self.assertNotEqual(body['success'], False)
        respondant = Respondant.objects.get(pk=self.respondant.pk)
        self.assertEqual(respondant.user, self.respondant_user)

    def test_edit_with_new_user(self):
        self.new_user = User.objects.create(username='new_user',
                                            email='new_user@example.com',
                                            password=make_password('pass'),
                                            is_staff=True)
        self.client.login(username='new_user', password='pass')
        res = self.client.post(self.get_url(), data={
            json.dumps({
                'answer': {
                    'text': 'Ball Beach'
                }
            }): None
        })
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.content)
        self.assertNotEqual(body['success'], False)
        respondant = Respondant.objects.get(pk=self.respondant.pk)
        self.assertEqual(respondant.user, self.respondant_user)
