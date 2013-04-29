from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance

from places.models import Place, ShoreLine


import csv

excluded_types = ["Airport", "Building", "Cemetary",
                    "Census", "Church", "Civil", "Hospital", "Summit", "Tower",
                    "Military", "Mine", "School", "Post Office", "Tunnel", "Well"]

class Command(BaseCommand):
    args = '<gnis text file>'
    help = 'Load places data'

    def handle(self, *args, **options):
        reader = csv.DictReader(open(args[0]),delimiter='|')
        rows = 0
        for row in reader:
            #if rows > 1000:
            #    break
            rows += 1
            kwargs = {
                'type': row['FEATURE_CLASS'],
                'name': row['FEATURE_NAME'],
                'state': row['STATE_ALPHA'],
                'county': row['COUNTY_NAME'],
                'lat': row['PRIM_LAT_DEC'],
                'lng': row['PRIM_LONG_DEC']
            }

            if kwargs['type'] not in excluded_types:
                place, created = Place.objects.get_or_create(type=kwargs['type'], name=kwargs['name'], state=kwargs['state'], county=kwargs['county'])
                place.lat = kwargs['lat']
                place.lng = kwargs['lng']
                place.location = Point(float(place.lat), float(place.lng))
                #place.save()
                # shoreline = ShoreLine.objects.filter(geom__distance_lt=(place.location, Distance(m=5000)))
                # if shoreline.count() > 0:
                #     place.save()
                #     print rows, place
                # else:
                #     print rows, place, " not near shore"
                print rows, place
                place.save()

        print Place.objects.all().count()
