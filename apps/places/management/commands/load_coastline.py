from django.core.management.base import BaseCommand, CommandError

from apps.places import load
import os

class Command(BaseCommand):

    def handle(self, *args, **options):
        load.run()
