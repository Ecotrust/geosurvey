# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext, Context
from django.shortcuts import get_object_or_404
from django.template.loader import get_template
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

import datetime
import simplejson

from apps.survey.models import Survey, Question, Response, Respondant

@staff_member_required
def delete_responses(request, uuid, template='survey/delete.html'):
    respondant = get_object_or_404(Respondant, uuid=uuid)
    for response in respondant.responses.all():
        response.delete()
    respondant.responses.clear()
    respondant.save()
    return render_to_response(template, RequestContext(request, {}))

def survey(request, survey_slug=None, template='survey/survey.html'):
    if survey_slug is not None:
        survey = get_object_or_404(Survey, slug=survey_slug, anon=True)
        respondant = Respondant(survey=survey)
        respondant.save()
        if request.GET.get('get-uid', None) is not None:
            return HttpResponse(simplejson.dumps({'success': "true", "uuid": respondant.uuid}))
        return redirect("/respond#/survey/%s/0/%s/landing" % (survey.slug, respondant.uuid))
    context = {'ANALYTICS_ID': settings.ANALYTICS_ID}
    return render_to_response(template, RequestContext(request, context))

@staff_member_required
def dash(request, template='survey/dash.html'):
    return render_to_response(template, RequestContext(request, {}))

@login_required
def fisher(request, uuid=None, template='survey/fisher-dash.html'):
    if uuid is None:
        respondents = Respondant.objects.all().order_by('-ts')
        if not request.user.is_staff:
            respondents = respondents.filter(user=request.user)
        return render_to_response(template, RequestContext(request, {'respondents': respondents}))
    else:
        respondent = Respondant.objects.get(uuid=uuid)
        template='survey/fisher-detail.html'
        return render_to_response(template, RequestContext(request, {'respondent': respondent}))
    


def submit_page(request, survey_slug, uuid): #, survey_slug, question_slug, uuid):
    if request.method == 'POST':
        survey = get_object_or_404(Survey, slug=survey_slug)
        respondant = get_object_or_404(Respondant, uuid=uuid)
        
        if respondant.complete is True and not request.user.is_staff:
            return HttpResponse(simplejson.dumps({'success': False, 'complete': True}))
        print request.POST        
        answers = simplejson.loads(request.POST.keys()[0]).get('answers', None)

        for answerDict in answers:
            answer = answerDict['answer']
            question_slug = answerDict['slug']
            
            question = get_object_or_404(Question, slug=question_slug, question_page__survey=survey)
            response, created = Response.objects.get_or_create(question=question,respondant=respondant)
            response.answer_raw = simplejson.dumps(answer)
            response.ts = datetime.datetime.now()
            print request.user
            if request.user.is_authenticated():
                response.user = request.user
            response.save_related()

            if created:
                respondant.responses.add(response)

        if request.user.is_authenticated():
            respondant.user = request.user

        respondant.last_question = question_slug
        respondant.save()

        return HttpResponse(simplejson.dumps({'success': True }))
    return HttpResponse(simplejson.dumps({'success': False}))



def answer(request, survey_slug, question_slug, uuid): #, survey_slug, question_slug, uuid):
    if request.method == 'POST':

        survey = get_object_or_404(Survey, slug=survey_slug)
        question = get_object_or_404(Question, slug=question_slug, survey=survey)
        respondant = get_object_or_404(Respondant, uuid=uuid)
        if respondant.complete is True and not request.user.is_staff:
            return HttpResponse(simplejson.dumps({'success': False, 'complete': True}))

        response, created = Response.objects.get_or_create(question=question,respondant=respondant)
        response.answer_raw = simplejson.dumps(simplejson.loads(request.POST.keys()[0]).get('answer', None))
        response.save_related()

        if created:
            respondant.responses.add(response)

        if request.user and not respondant.user:
            respondant.user = request.user
            response.user = request.user
        respondant.last_question = question_slug
        respondant.save()
        return HttpResponse(simplejson.dumps({'success': "%s/%s/%s" % (survey_slug, question_slug, uuid)}))
    return HttpResponse(simplejson.dumps({'success': False}))


def complete(request, survey_slug, uuid, action=None, question_slug=None):
    if request.method == 'POST':
        survey = get_object_or_404(Survey, slug=survey_slug)
        respondant = get_object_or_404(Respondant, uuid=uuid, survey=survey)
        print action, question_slug

        if action is None and question_slug is None:
            respondant.complete = True
            respondant.status = 'complete'
        elif action == 'terminate' and question_slug is not None:
            respondant.complete = False
            respondant.status = 'terminate'
            respondant.last_question = question_slug
        respondant.save()
        return HttpResponse(simplejson.dumps({'success': True}))
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

    subject, from_email, to = 'Take The Survey', 'Coastal Recreation Survey <surveysupport@surfrider.org>', email
    text_content = plaintext.render(d)
    html_content = htmly.render(d)

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

@csrf_exempt
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
