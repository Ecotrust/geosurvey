# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context


from tracker.models import Respondant


def send_email(email, uuid):

    plaintext = get_template('tracker/email.txt')
    htmly = get_template('tracker/email.html')

    d = Context({'uuid': uuid})

    subject, from_email, to = 'Take The Survey', 'eknuth@ecotrust.org', email
    text_content = plaintext.render(d)
    html_content = htmly.render(d)

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def register(request, template='tracker/register.html'):
    if request.POST:
        # create respondant record
        email = request.POST.get('emailAddress', None)
        if email is not None:
            respondant, created = Respondant.objects.get_or_create(email=email)
            send_email(respondant.email, respondant.uuid)
            return render_to_response('tracker/thankyou.html', RequestContext(request, {}))

    return render_to_response(template, RequestContext(request, {}))
