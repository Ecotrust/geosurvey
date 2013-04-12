from django.contrib import admin
from survey.models import Survey


class SurveyAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug':('name',),}

admin.site.register(Survey, SurveyAdmin)