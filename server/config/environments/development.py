from path import path
from config.settings import *


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'geosurvey',
        'USER': 'vagrant',
#        'HOST': 'localhost',
#        'PORT': '5432'
    }
}

DEBUG = True

# CACHES = {
#     'default': {
#         'BACKEND': 'redis_cache.RedisCache',
#         'LOCATION': 'localhost:6379',
#         'OPTIONS': {
#             'DB': 1,
#             'PARSER_CLASS': 'redis.connection.HiredisParser'
#         },
#     },
# }
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
COMPRESS_ENABLED = False

# config/environments/local.py is ignored to allow for easy settings
# overrides without affecting others environments / developers
try:
    from local import *
except ImportError:
    pass
