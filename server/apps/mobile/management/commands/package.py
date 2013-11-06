from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from apps.survey.api import *
from optparse import make_option
from subprocess import call
import os, errno
import re
import urllib
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
    option_list = BaseCommand.option_list + (
        make_option('-T', '--test-run',
            action='store_true',
            default=False,
            help='Do not increment the version number.'),
        make_option('-I', '--id',
            action='store',
            default="com.pointnineseven.digitaldeck",
            help='Specify the app id.'),
        make_option('-S', '--stage',
            action='store',
            default="dev",
            help='Specify the app stage (dev, text, etc).')
        )
    def handle(self, *args, **options):
        url = args[0]
        destDir = args[1]
        test = options.get('test_run', None)
        ident = options.get('id')
        print "Packaging for %s" % url
        dest = settings.PROJECT_ROOT / destDir

        # copy the app html
        app_src = settings.PROJECT_ROOT / 'static/survey/mobile.html'
        app_dest = "%s/index.html" % dest
        shutil.copyfile(app_src, app_dest)
        with open(dest / 'config.xml') as f:
            content = f.read()
            version = re.search('version="(\d+)\.(\d+)\.(\d+)"', content)
            old_name = re.search('widget id="(\S*)"', content).group(1)
            
            #update the app name
            content = content.replace("widget id=\"%s\"" % old_name, "widget id=\"%s\"" % ident)
            old_version =  ".".join([version.group(1), version.group(2), version.group(3)])
            if test is False:
                new_version =  ".".join([version.group(1), version.group(2), str(int(version.group(3)) + 1)])
                print "Updating to %s" % new_version
                content = content.replace("version=\"%s\"" % old_version, "version=\"%s\"" % new_version)
            else:
                print "Not Updating Version Number"

        with open(dest / 'config.xml', 'w') as f:
            f.write(content)
        
        # copy app assets
        copy_dir('static/survey/assets', "%s/assets" % dest)
        copy_dir('static/survey/views', "%s/views" % dest)
        os.system("sed -i -e 's,APP_SERVER,%s,' %s/assets/js/app.js" % (url, dest))
        
        os.system("sed -i -e 's,APP_SERVER,%s,' %s/views/main.html" % (url, dest))
        if test is False:
            os.system("sed -i -e 's,APP_VERSION,%s,' %s/assets/js/app.js" % (new_version, dest))
        else:
            os.system("sed -i -e 's,APP_VERSION,%s,' %s/assets/js/app.js" % (old_version, dest))
        survey_url = "%s/api/v1/survey/?format=json" % url
        local_filename, headers = urllib.urlretrieve(survey_url)
        shutil.copyfile(local_filename, dest / 'assets/surveys.json')
