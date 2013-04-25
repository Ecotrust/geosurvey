from django.contrib.gis.db import models

class Place(models.Model):
    name = models.CharField(max_length=254)
    state = models.CharField(max_length=2)
    county = models.CharField(max_length=254)
    type = models.CharField(max_length=254)
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    location = models.PointField(srid=4326, null=True, blank=True)
    objects = models.GeoManager()

    def __str__(self):
        return "%s: %s, %s (%s)" % (self.name, self.state, self.county, self.type)




class ShoreLine(models.Model):
    s_scale = models.IntegerField()
    s_chart = models.CharField(max_length=7)
    s_datum = models.IntegerField()
    s_rev_date = models.CharField(max_length=5)
    s_source = models.IntegerField()
    s_arc_code = models.IntegerField()
    s_integrit = models.IntegerField()
    regions = models.CharField(max_length=2)
    geom = models.MultiLineStringField(srid=4326)
    objects = models.GeoManager()