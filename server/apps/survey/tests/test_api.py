from tastypie.test import ResourceTestCase
from django.contrib.auth.models import User
from ..api import SurveyResource
from ..models import Respondant, Response, Survey, Page

class SurveyResourceTest(ResourceTestCase):
    # Use ``fixtures`` & ``urls`` as normal. See Django's ``TestCase``
    # documentation for the gory details.
    fixtures = ['surveys.json.gz']

    def setUp(self):
        super(SurveyResourceTest, self).setUp()

        # Create a user.
        self.username = 'fisher'
        self.password = 'secret'
        self.user = User.objects.create_user(self.username, 'fish@example.com', self.password)
        self.user.is_staff = True
        self.user.save()


    def test_get_survey(self):
        res = self.api_client.get('/api/v1/survey/catch-report/', format='json')
        self.assertValidJSONResponse(res)

        survey = self.deserialize(res)

        self.assertEqual(survey['slug'], 'catch-report')
    
    def get_credentials(self):
        result = self.api_client.client.login(username='fisher',
                                              password='secret')
        return result

    def test_order_pages(self):
        result = self.api_client.client.login(username='fisher', password='secret')
        original_data = self.deserialize(self.api_client.get('/api/v1/survey/catch-report/',
            format='json'))
        
        new_data = original_data.copy()
        
        #first page has an order of 2, need to switch it to 1
        self.assertEqual(original_data['pages'][1]['order'], 2)

        # first page has 3 questions
        self.assertEqual(len(original_data['pages'][1]['questions']), 3)
        new_data['pages'][1]['order'] = 1
        new_data['pages'][1]['questions'] = map(lambda x: x['resource_uri'],
            new_data['pages'][1]['questions'])

        res = self.api_client.put(original_data['pages'][1]['resource_uri'],
            format='json', data=new_data['pages'][1],
            authentication=self.get_credentials())

        # order has been updates and number of questions is the same
        self.assertHttpAccepted(res)
        self.assertEqual(Page.objects.get(pk=original_data['pages'][1]['id']).order,
            1)
        self.assertEqual(Page.objects.get(pk=original_data['pages'][1]['id']).questions.count(),
            3)
        