from django.db import models

import datetime
import uuid


def make_uuid():
    return str(uuid.uuid4())


class Respondant(models.Model):
    ts = models.DateTimeField(default=datetime.datetime.now())
    email = models.EmailField(max_length=254)

    uuid = models.CharField(max_length=36, primary_key=True,
          default=make_uuid, editable=False)