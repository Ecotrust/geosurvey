from django.core.management.base import BaseCommand, CommandError

from survey.models import Response


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        for response in Response.objects.all():
            response.save()
