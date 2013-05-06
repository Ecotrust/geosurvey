from django.core.management.base import BaseCommand, CommandError

from places.models import Place


import csv

excluded_types = ["Airport", "Building", "Cemetery", "Crossing", "Locale", 
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
        
                print rows, place
                place.save()

        print Place.objects.all().count()
