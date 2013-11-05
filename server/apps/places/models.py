from django.db import models

import caching.base


class Place(caching.base.CachingMixin, models.Model):
    name = models.CharField(max_length=254)
    state = models.CharField(max_length=2)
    county = models.CharField(max_length=254)
    type = models.CharField(max_length=254)

    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    objects = caching.base.CachingManager()


    def __str__(self):
        return "%s: %s, %s (%s)" % (self.name, self.state, self.county, self.type)