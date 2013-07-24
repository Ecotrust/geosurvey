from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from django.template.loader import get_template
from django.template import Context
from django.core.mail import get_connection, EmailMultiAlternatives
from survey.models import Survey, Response, Respondant


class Command(BaseCommand):
    args = ''
    help = 'Correct spelling of Virgina.'

    option_list = BaseCommand.option_list + (
            make_option('-d', '--dryrun',
                action='store_true',
                dest='is_dry_run',
                default=False,
                help='Show the list of emails that would be sent without sending.'),
            )


    def handle(self, *args, **options):
        responses = Response.objects.filter(question__slug='state', answer='Virgina')
        self.stdout.write('Correcting %s' % str(len(responses)), ending='')
        
        # Correct
        for r in responses:
            self.stdout.write('.', ending='')
            r.answer_raw = r.answer_raw.replace('Virgina', 'Virginia')
        self.stdout.write('')
        
        # Save
        if not options['is_dry_run']:
            self.stdout.write('Saving...')
            for r in responses:
                r.save()
            self.stdout.write('Done')
