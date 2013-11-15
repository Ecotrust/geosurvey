from django.contrib import admin
from account.models import *

from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

# class YourUserAdmin(UserAdmin):
#     actions = list(UserAdmin.actions) + ['send_reset_password']

#     def send_reset_password(request, email):
#         form = PasswordResetForm({'email': email})
#         form.full_clean()
#         form.save({
#             'token_generator': default_token_generator,
#             'from_email': 'edwin@pointnineseven.com',
#             'email_template_name': 'registration/password_reset_email.html',
#             'request': request
#         })

# admin.site.unregister(User)
# admin.site.register(User, YourUserAdmin)


class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'message', 'ts')


admin.site.register(UserProfile)
admin.site.register(Feedback, FeedbackAdmin)
