from config.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'geosurvey',
        'USER': 'postgres',
#        'HOST': 'localhost',
#        'PORT': '5432'
    }
}

DEBUG = True
TEMPLATE_DEBUG = DEBUG

# settings/local.py is ignored to allow for easy settings
# overrides without affecting others
try:
    from local import *
except ImportError:
    pass
