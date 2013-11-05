from django.db import models
from django.contrib.auth.models import User
import datetime


class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
    registration = models.TextField(null=True, blank=True, default=None)

    def __str__(self):
        return "%s" % (self.user.username)

User.profile = property(lambda u: UserProfile.objects.get_or_create(user=u)[0])


class Feedback(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    message = models.TextField(null=True, blank=True, default=None)
    data = models.TextField(null=True, blank=True, default=None)
    ts = models.DateTimeField(default=datetime.datetime.now())

    def __unicode__(self):
        if self.user is not None:
            return "%s" % (self.user.username)
        else:
            return "Anonymous"
