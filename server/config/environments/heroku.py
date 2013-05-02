from path import path
from config.settings import *
import dj_database_url

DATABASES = {
    'default': dj_database_url.config()
    
}

DEBUG = True
HEROKU = True

# Parse database configuration from $DATABASE_URL
  
# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# config/environments/local.py is ignored to allow for easy settings
# overrides without affecting others environments / developers
try:
    from local import *
except ImportError:
    pass
