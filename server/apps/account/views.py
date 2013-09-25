from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, check_password
from django.contrib.auth.forms import PasswordResetForm
from account.models import UserProfile

import simplejson


@csrf_exempt
def authenticateUser(request):
    print request
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        # user = User.objects.get(username=param.get('username', None))
        user = authenticate(username=param.get(
            'username', None), password=param.get('password'))
        try:
            login(request, user)
        except:
            return HttpResponse("auth-error", status=500)

        if user:
            profile = user.profile
            user_dict = {
                'username': user.username,
                'name': ' '.join([user.first_name, user.last_name]),
                'is_staff': user.is_staff,
                'registration': user.profile.registration
            }
            return HttpResponse(simplejson.dumps({
                'success': True, 'user': user_dict
            }))
        else:
            return HttpResponse(simplejson.dumps({'success': False}))
    else:
        return HttpResponse("error", status=500)


@csrf_exempt
def createUser(request):
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        user, created = User.objects.get_or_create(
            username=param.get('username', None))
        if created:
            if param.get('password1') == param.get('password2'):
                user.set_password(param.get('password1'))
                user.save()
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.registration = '{}'
                profile.save()
                user.save()
                user = authenticate(
                    username=user.username, password=param.get('password1'))
                login(request, user)
                user_dict = {
                    'username': user.username,
                    'name': ' '.join([user.first_name, user.last_name]),
                    'is_staff': user.is_staff,
                    'registration': profile.registration
                }
                return HttpResponse(simplejson.dumps({'success': True, 'user': user_dict}))
        else:
            return HttpResponse("duplicate-user", status=500)
    else:
        return HttpResponse("error", status=500)

@csrf_exempt
def forgotPassword(request):
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        # email = param.get('email', None)
        # form = PasswordResetForm({'email': email})
        # form.save(from_email='eknuth@ecotrust.org', email_template_name='registration/password_reset_email.html')
        return HttpResponse(simplejson.dumps({'success': True}))
    else:
        return HttpResponse("error", status=500)

@csrf_exempt
def updateUser(request):
    if request.method == "POST":
        param = simplejson.loads(request.body)
        user = get_object_or_404(User,
            username=param.get('username', None))
        if user:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.registration = simplejson.dumps(param.get('registration'))
            profile.save()
            user.save()
            user_dict = {
                'username': user.username,
                'name': ' '.join([user.first_name, user.last_name]),
                'is_staff': user.is_staff,
                'registration': user.profile.registration
            }
            return HttpResponse(simplejson.dumps({'success': True, 'user': user_dict}))
        else:
            return HttpResponse("user-not-found", status=500)
    else:
        return HttpResponse("error", status=500)
