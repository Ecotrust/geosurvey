from config.settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
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
