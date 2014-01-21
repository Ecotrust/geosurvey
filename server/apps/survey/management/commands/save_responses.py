from django.core.management.base import BaseCommand
from optparse import make_option
from survey.models import Respondant, Response
import traceback

class Command(BaseCommand):
    help = 'Save All Responses'
    option_list = BaseCommand.option_list + (
        make_option('-d', '--white-space',
            action='store_true',
            default=False,
            help='Get responses with funky white space.'),
        make_option('-I', '--question_id',
            action='store',
            default=False,
            help='Get responses for a specific quesiton.'),
    )

    def handle(self, *args, **options):
        white_space = options.get('white_space')
        question_id = options.get('question_id')
        responses = Response.objects.all().order_by('-id')
        if question_id:
            responses = responses.filter(question__id=question_id)
        if white_space:
            responses = responses.filter(answer__contains="\r")
        print "Saving Answers for %s Responses" % responses.count()
        for response in responses:
            # print response.question.slug
            try:
                response.save_related()
            except Exception as e:
                print 'EXCEPTION, question is:' + response.question.slug
                print traceback.format_exc()
                pass
        print "Done"