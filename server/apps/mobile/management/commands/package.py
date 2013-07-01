from django.core.management.base import BaseCommand, CommandError
import os

class Command(BaseCommand):

    def handle(self, *args, **options):
        print "Packaging"
