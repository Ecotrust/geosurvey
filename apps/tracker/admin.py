from django.contrib import admin
from tracker.models import Respondant


class RespondantAdmin(admin.ModelAdmin):
    readonly_fields=('uuid',)

admin.site.register(Respondant, RespondantAdmin)