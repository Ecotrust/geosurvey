from django.core.management.base import BaseCommand, CommandError

from survey.models import Response


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        i = 1
        for response in Response.objects.all():
            print str(i)
            i += 1
            response.save()
