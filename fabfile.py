from fabric.api import *

vars = {
    'app_dir': '/usr/local/apps/geosurvey/server',
    'venv': '/usr/local/apps/geosurvey/geosurvey_env'
}

env.forward_agent = True



def dev():
    """ Use development server settings """
    servers = ['vagrant@127.0.0.1:2222']
    env.hosts = servers
    env.key_filename = '~/.vagrant.d/insecure_private_key'
    vars['app_dir'] = '/vagrant/server'
    vars['venv'] = '/usr/local/venv/geosurvey'
    return servers


def prod():
    """ Use production server settings """
    servers = []
    env.hosts = servers
    return servers


def test():
    """ Use test server settings """
    servers = ['dionysus']
    env.hosts = servers
    return servers


def all():
    """ Use all servers """
    env.hosts = dev() + prod() + test()


def _install_requirements():
    run('cd %(app_dir)s && %(venv)s/bin/pip install -r requirements.txt' % vars)


def install_bowerdeps():
    run('cd /vagrant && /usr/bin/bower install --dev')

#%(venv)s/bin/python manage.py site localhost:8080 && \
#/usr/local/bin/node-v0.8.23/bin/bower install --dev && \
def _install_django():
    run('cd %(app_dir)s && %(venv)s/bin/python manage.py collectstatic --noinput && \
                           sudo chgrp -R www-data . && \
                           sudo chmod -R g+w . && \
                           sudo chmod -R g+w ../.git && \
                           sudo chgrp -R www-data ../.git && \
                           %(venv)s/bin/python manage.py migrate && \
                           /usr/bin/touch wsgi.py' % vars)



def migrate():
    run('cd %(app_dir)s && %(venv)s/bin/python manage.py migrate' % vars)


def create_superuser():
    """ Create the django superuser (interactive!) """
    run('cd %(app_dir)s && %(venv)s/bin/python manage.py createsuperuser' % vars)


def init():
    
    #_install_bowerdeps()
    _install_django()


def update():
    """ Sync with master git repo """
    run('cd %(app_dir)s && git fetch && git merge origin/master' % vars)
    init()


def loaddata():
    run("cd %s && %s/bin/python manage.py loaddata apps/survey/fixtures/surveys.json" % (vars['app_dir'], vars['venv']))

def dumpdata():
    survey_json = "%s/apps/survey/fixtures/surveys.json" % vars['app_dir']
    run("cd %s && %s/bin/python manage.py dumpdata survey --exclude survey.Response --exclude survey.Respondant  | python -mjson.tool > ~/surveys.json" % (vars['app_dir'], vars['venv']))
    get("~/surveys.json", 'server/apps/survey/fixtures/')
  #run('cd /vagrant/server && /usr/local/venv/geosurvey/bin/python manage.py dumpdata places --exclude places.ShoreLine |gzip > apps/places/fixtures/initial_data.json.gz')

def run_server():
	run('cd /vagrant/server && /usr/local/venv/geosurvey/bin/python manage.py runserver 0.0.0.0:8000')

def kill_server():
        run('killall python')
# def update(): 
#    run('cd /usr/local/apps/land_owner_tools/lot/ && git fetch && git merge origin/master')
