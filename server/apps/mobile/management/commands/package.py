from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from apps.survey.api import *

import os
import requests
import simplejson
import path
import shutil

def copy_dir(src, dst):
    full_src = settings.PROJECT_ROOT / src
    full_dst = dst

    try:
        shutil.copytree(full_src, full_dst)
    except OSError as exc: # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else: raise


class Command(BaseCommand):

    def handle(self, *args, **options):
        print "Packaging"
        url = "http://%s" % args[0]
        dest = settings.PROJECT_ROOT / '../mobile'
        api = "%s/api" % dest

        try:
            shutil.rmtree(dest)
        except OSError, e:
            print e

        os.makedirs(api)
        # load surveys
        r = requests.get("%s/api/v1/survey/?format=json" % url)
        surveys = r.json()

        # write survey json to file system
        with open("%s/surveys.json" % api,'w') as f:
            f.write(r.text)

        for survey in surveys['objects']:
            with open("%s/%s.json" % (api, survey['slug']),'w') as f:
                f.write(simplejson.dumps(survey))


        # copy the app html
        app_src = settings.PROJECT_ROOT / 'static/survey/mobile.html'
        app_dest = "%s/index.html" % dest
        shutil.copyfile(app_src, app_dest)
        
        # copy app assets
        copy_dir('static/survey/assets', "%s/assets" % dest)
        copy_dir('static/survey/views', "%s/views" % dest)
        