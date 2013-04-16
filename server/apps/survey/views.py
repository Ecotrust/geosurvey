# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext, Context
from django.shortcuts import get_object_or_404
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.decorators import login_required

import simplejson

from apps.survey.models import Survey, Question, Response, Respondant

@login_required
def delete_responses(request, uuid, template='survey/delete.html'):
    respondant = get_object_or_404(Respondant, uuid=uuid)
    for response in respondant.responses.all():
        response.delete()
    respondant.responses.clear()
    respondant.save()
    return render_to_response(template, RequestContext(request, {}))

def survey(request, template='survey/survey.html'):
    return render_to_response(template, RequestContext(request, {}))

def answer(request, survey_slug, question_slug, uuid): #, survey_slug, question_slug, uuid):
    if request.method == 'POST':
        survey = get_object_or_404(Survey, slug=survey_slug)
        question = get_object_or_404(Question, slug=question_slug)
        respondant = get_object_or_404(Respondant, uuid=uuid)
        response, created = Response.objects.get_or_create(question=question,respondant=respondant)

        response.answer = simplejson.loads(request.POST.keys()[0]).get('answer', None)

        response.save()
        respondant.responses.add(response)

        return HttpResponse(simplejson.dumps({'success': "%s/%s/%s" % (survey_slug, question_slug, uuid)}))
    return HttpResponse(simplejson.dumps({'success': False}))

def send_email(email, uuid):
    from django.contrib.sites.models import Site

    current_site = Site.objects.get_current()
    
    plaintext = get_template('survey/email.txt')
    htmly = get_template('survey/email.html')

    d = Context({
        'uuid': uuid,
        'SITE_URL': current_site.domain
        })

    subject, from_email, to = 'Take The Survey', 'eknuth@ecotrust.org', email
    text_content = plaintext.render(d)
    html_content = htmly.render(d)

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def register(request, template='survey/register.html'):
    if request.POST:
        # create respondant record
        email = request.POST.get('emailAddress', None)
        survey_slug = request.POST.get('survey', None)
        if email is not None:
            survey = get_object_or_404(Survey, slug=survey_slug)
            respondant, created = Respondant.objects.get_or_create(email=email, survey=survey)
            send_email(respondant.email, respondant.uuid)
            return render_to_response('survey/thankyou.html', RequestContext(request, {}))

    return render_to_response(template, RequestContext(request, {}))
