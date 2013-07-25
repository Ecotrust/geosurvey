from django.contrib import admin
from survey.models import Survey, Question, Option, Response, Respondant, Page, Location, LocationAnswer, MultiAnswer, GridAnswer, Block



class RespondantAdmin(admin.ModelAdmin):
    readonly_fields=('uuid',)
    list_display = ('uuid', 'ts', 'complete',)

class PageInline(admin.TabularInline):
    model = Page


class SurveyAdmin(admin.ModelAdmin):
    list_display = ('name','slug',)
    prepopulated_fields = {'slug':('name',),}

class QuestionAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug':('label',),'info':('label',),}
    list_display = ('survey_slug','slug','type', 'title',  )
    

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
admin.site.register(Page)
admin.site.register(Location)
admin.site.register(LocationAnswer)
admin.site.register(MultiAnswer)
admin.site.register(GridAnswer)
admin.site.register(Block)