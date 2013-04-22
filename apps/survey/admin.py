from django.contrib import admin
from survey.models import Survey, Question, Option, Response, Respondant



class RespondantAdmin(admin.ModelAdmin):
    readonly_fields=('uuid',)



class QuestionInline(admin.TabularInline):
    model = Survey.questions.through


class SurveyAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug':('name',),}


class QuestionAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug':('label',),}
    class Media:
        js = [
           '/static/grappelli/tinymce/jscripts/tiny_mce/tiny_mce.js'
        ]

class OptionAdmin(admin.ModelAdmin):
    prepopulated_fields = {'label':('text',),}


admin.site.register(Respondant, RespondantAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(Response)