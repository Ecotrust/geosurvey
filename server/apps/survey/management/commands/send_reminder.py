from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from survey.models import Survey, Response


class Command(BaseCommand):
    args = '--survey survey_slug --html html_template_path --text text_template_path [--dryrun]'
    help = 'Send an email to all registered respondants having not yet taken the survey.'

    option_list = BaseCommand.option_list + (
            make_option('--survey',
                action='store',
                dest='survey_slug',
                default='',
                type='string',
                help='Slug to identify the survey.'),
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
        #self.stdout.write('survey:\t' + options['survey_slug'])
        #self.stdout.write('html: \t' + options['html_path'])
        #self.stdout.write('text: \t' + options['text_path'])
        #self.stdout.write('dry: \t%r' % options['is_dry_run'])
        #self.stdout.write('')

        text = get_template(options['text_path'])
        html = get_template(options['html_path'])

        addresses = self.getAddresses(options['survey_slug'])

        for address in addresses:
            self.sendTo(address, html, text)


    def ensureSurveyExists(self, slug):
        survey = Survey.objects.get(slug=slug)

    def getAddresses(self, slug):
        self.stdout.write('Getting Addresses for: ' + slug)
        Respondant.objects.filter(last_question=None, complete=False).exclude(email=None).values('email')
        survey = Survey.objects.get(slug=slug)
        return ('tglaser@gmail.com', 'tglaser@ecotrust.org')


    def sendTo(self, address, html_template, text_template):
        self.stdout.write('Sending to: ' + address);




# def send_email(email, uuid):
#     from django.contrib.sites.models import Site

#     current_site = Site.objects.get_current()
    
#     plaintext = get_template('survey/email.txt')
#     htmly = get_template('survey/email.html')

#     d = Context({
#         'uuid': uuid,
#         'SITE_URL': current_site.domain
#         })

#     subject, from_email, to = 'Take The Survey', 'Coastal Recreation Survey <surveysupport@surfrider.org>', email
#     text_content = plaintext.render(d)
#     html_content = htmly.render(d)

#     msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
#     msg.attach_alternative(html_content, "text/html")
#     msg.send()        