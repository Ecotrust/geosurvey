from django.contrib import admin
from account.models import *



class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'message', 'ts')


admin.site.register(UserProfile)
admin.site.register(Feedback, FeedbackAdmin)
