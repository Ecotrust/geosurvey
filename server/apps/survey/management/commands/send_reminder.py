from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from django.template.loader import get_template
from django.template import Context
from django.core.mail import get_connection, EmailMultiAlternatives
from survey.models import Survey, Response, Respondant


class Command(BaseCommand):
    args = '--survey <survey_slug> --from <from_address> --subject <subject> --html <html_template_path> --text <text_template_path> [--dryrun]'
    help = 'Send an email to all registered respondants having not yet completed the survey (except respodants marked as "terminated").'

    option_list = BaseCommand.option_list + (
            make_option('--survey',
                action='store',
                dest='survey_slug',
                default='',
                type='string',
                help='Slug to identify the survey.'),
            make_option('--from',
                action='store',
                dest='from',
                default='Coastal Recreation Survey <surveysupport@surfrider.org>',
                type='string',
                help='Email address the emails will be sent from.'),
            make_option('--subject',
                action='store',
                dest='subject',
                default='Reminder: Surfrider Coastal Recreation Survey',
                type='string',
                help='Text to be used as the subject line for all of the emails.'),
            make_option('--html',
                action='store',
                dest='html_path',
                default='',
                type='string',
                help='Path to the email template in html format.'),
            make_option('--text',
                action='store',
                dest='text_path',
                default='',
                type='string',
                help='Path to the email template in text format.'),
            make_option('-d', '--dryrun',
                action='store_true',
                dest='is_dry_run',
                default=False,
                help='Show the list of emails that would be sent without sending.'),
            )


    def handle(self, *args, **options):
        from django.contrib.sites.models import Site
        current_site = Site.objects.get_current()
        text = get_template(options['text_path'])
        html = get_template(options['html_path'])
        respondants = self.getRespondantsToRemind(options['survey_slug'])
        connection = get_connection()
        self.is_dry_run = options['is_dry_run']

        if self.is_dry_run:
            self.stdout.write('')
            self.stdout.write('This is a DRY RUN. No emails will be sent. But here is the list of addresses for the %s survey on %s:' % (options['survey_slug'], current_site.domain))
            self.stdout.write('')

        for respondant in respondants:
            context = Context({
                'UUID': respondant['uuid'],
                'SITE_URL': current_site.domain,
                'SURVEY_SLUG': options['survey_slug']
                })
            self.send(options['from'], respondant['email'], options['subject'], context, html, text, connection)


    def getRespondantsToRemind(self, slug):
        self.stdout.write('Getting addresses for ' + slug)
        survey = Survey.objects.get(slug=slug)
        respondants = Respondant.objects.filter(complete=False).exclude(email=None).exclude(status='terminate').values('email', 'uuid')
        respondants = respondants.filter(survey=survey)
        #return [{'email': 'tglaser@ecotrust.org', 'uuid': 'uuid1'}]
        return respondants

    def send(self, from_address, to_address, subject, context, html_template, text_template, connection):
        if self.is_dry_run:
            self.stdout.write(to_address + ' (' + context['UUID'] + ')')
        else:
            self.stdout.write('Sending from ' + from_address + ' to ' + to_address + ' (' + context['UUID'] + ', ' + context['SURVEY_SLUG'] + ', ' + context['SITE_URL'] + ')');
        text_content = text_template.render(context)
        html_content = html_template.render(context)
        msg = EmailMultiAlternatives(subject, text_content, from_address, [to_address], connection=connection)
        msg.attach_alternative(html_content, "text/html")
        if not self.is_dry_run:
            msg.send()
