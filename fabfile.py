from fabric.api import * 

dev_server =  'vagrant@127.0.0.1:2222'
prod_server = []

env.forward_agent = True
env.key_filename = '~/.vagrant.d/insecure_private_key'

def dev(): 
   """ Use development server settings """
   env.hosts = [dev_server]
   
def prod():
   """ Use production server settings """ 
   env.hosts = [prod_server] 
   
   
def all(): 
   """ Use all serves """
   env.hosts = [dev_server, prod_server]


def install_requirements():
	run('cd /vagrant/server && /usr/local/venv/geosurvey/bin/pip install -r REQUIREMENTS')

def install_django():
	run('/vargrant/server && /usr/local/venv/geosurvey/bin/python manage.py syncdb && /usr/local/venv/geosurvey/bin/python manage.py migrate && /usr/local/venv/geosurvey/bin/python manage.py install_media')	

def install_media():
	run('cd /vagrant/server && /usr/local/venv/geosurvey/bin/python manage.py install_media')	


def run_server():
	run('cd /vagrant/server && /usr/local/venv/geosurvey/bin/python manage.py runserver 0.0.0.0:8000')

def kill_server():
        run('killall python')
# def update(): 
#    run('cd /usr/local/apps/land_owner_tools/lot/ && git fetch && git merge origin/master')
