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
                'is_staff': user.is_staff
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
                user = authenticate(
                    username=user.username, password=param.get('password1'))
                login(request, user)
                registration_dict = {
                    'first_name': param.get('first_name'),
                    'last_name': param.get('last_name'),
                    'vessel_num': param.get('vessel_num'),
                    'license_num': param.get('license_num'),
                    'species_permit_num': param.get('species_permit_num'),
                    'partner1_first_name': param.get('partner1_first_name'),
                    'partner1_last_name': param.get('partner1_last_name'),
                    'partner1_license_num': param.get('partner1_license_num'),
                    'partner2_first_name': param.get('partner2_first_name'),
                    'partner2_last_name': param.get('partner2_last_name'),
                    'partner2_license_num': param.get('partner2_license_num')
                    }
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.registration = simplejson.dumps(registration_dict)
                profile.save()
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
