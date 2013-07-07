from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from apps.survey.api import *

from subprocess import call
import os, errno
import requests
import simplejson
import path
import shutil

def copy_dir(src, dst):
    full_src = settings.PROJECT_ROOT / src
    full_dst = dst

    try:
        try:
            shutil.rmtree(full_dst)
        except:
            pass
        shutil.copytree(full_src, full_dst)
    except OSError as exc: # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else: raise


class Command(BaseCommand):

    def handle(self, *args, **options):
        url = args[0]
        print "Packaging for %s" % url
        dest = settings.PROJECT_ROOT / '../android/app/assets/www'

        # copy the app html
        app_src = settings.PROJECT_ROOT / 'static/survey/mobile.html'
        app_dest = "%s/index.html" % dest
        shutil.copyfile(app_src, app_dest)
        
        # copy app assets
        copy_dir('static/survey/assets', "%s/assets" % dest)
        copy_dir('static/survey/views', "%s/views" % dest)
        os.system("sed -i -e 's/APP_SERVER/%s/' %s/assets/js/app.js" % (url, dest))
