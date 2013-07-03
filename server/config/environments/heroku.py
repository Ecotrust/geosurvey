from path import path
from config.settings import *
import dj_database_url
import urlparse
import os

DATABASES = {
    'default': dj_database_url.config()
    
}

DEBUG = False
HEROKU = True

ALLOWED_HOSTS = [os.environ['ALLOWED_HOSTS']]


try:
    EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']
except KeyError: 
    pass

try:
    redis_url = urlparse.urlparse(os.environ.get('REDISTOGO_URL', None))
    CACHES = {
        'default': {
            'BACKEND': 'redis_cache.RedisCache',
            'LOCATION': '%s:%s' % (redis_url.hostname, redis_url.port),
            'OPTIONS': {
                'DB': 0,
                'PASSWORD': redis_url.password,
            }
        }
    }
except AttributeError:
    print "NO REDIS!!!!!!!!!"
    pass

# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
#     }
# }

COMPRESS_ENABLED = True
# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
# AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
# AWS_STORAGE_BUCKET_NAME = 'marco-survey'

# STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

# STATIC_URL = 'http://' + AWS_STORAGE_BUCKET_NAME + '.s3.amazonaws.com/'
# ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# config/environments/local.py is ignored to allow for easy settings
# overrides without affecting others environments / developers
try:
    from local import *
except ImportError:
    pass
