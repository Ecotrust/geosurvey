from django.core.management.base import BaseCommand
from optparse import make_option
from survey.models import Respondant, Response
import traceback

class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        respondents = Respondant.objects.filter(survey__slug='marco', complete=True)
        print "Saving %s respondents" % respondents.count()
        for respondent in respondents:
            respondent.save()
        print "Done"
