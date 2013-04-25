from django.core.management.base import BaseCommand, CommandError
from places.models import Place, ShoreLine
from django.contrib.gis.gdal import DataSource

import os

class Command(BaseCommand):
    args = '<gnis text file>'
    help = 'Load places data'

    def handle(self, *args, **options):
        shp = os.path.abspath(args[0])
        ds = DataSource(shp)
        lyr = ds[0]
        print lyr
