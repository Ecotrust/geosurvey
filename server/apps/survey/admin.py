from django.contrib import admin
from survey.models import Survey, Question, Option, Response, Respondant, Page, Location, LocationAnswer, MultiAnswer, GridAnswer, Block



class RespondantAdmin(admin.ModelAdmin):
    readonly_fields=('uuid', 'responses')
    list_display = ('uuid', 'ts', 'complete',)



class ResponseAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'ts',)



class PageInline(admin.TabularInline):
    model = Page


class PageAdmin(admin.ModelAdmin):
    list_display = ('__unicode__','order', 'block_name')

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "blocks":
            kwargs["queryset"] = Block.objects.all().order_by('name')
        if db_field.name == "questions":
            kwargs["queryset"] = Question.objects.all().order_by('slug')
        return super(PageAdmin, self).formfield_for_manytomany(db_field, request, **kwargs)
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "question":
            kwargs["queryset"] = Question.objects.all().order_by('slug')
        return super(PageAdmin, self).formfield_for_foreignkey(db_field, request, **kwargs)


class BlockAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'skip_question')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "skip_question":
            kwargs["queryset"] = Question.objects.all().order_by('title')
        return super(BlockAdmin, self).formfield_for_foreignkey(db_field, request, **kwargs)

class SurveyAdmin(admin.ModelAdmin):
    list_display = ('name','slug',)
    prepopulated_fields = {'slug':('name',),}

class QuestionAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug':('label',),'info':('label',),}
    list_display = ('survey_slug','slug','type', 'title', '__unicode__' )
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "blocks":
            kwargs["queryset"] = Block.objects.all().order_by('name')
        return super(QuestionAdmin, self).formfield_for_manytomany(db_field, request, **kwargs)

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
admin.site.register(Response, ResponseAdmin)
admin.site.register(Page, PageAdmin)
admin.site.register(Location)
admin.site.register(LocationAnswer)
admin.site.register(MultiAnswer)
admin.site.register(GridAnswer)
admin.site.register(Block, BlockAdmin)