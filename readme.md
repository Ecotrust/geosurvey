[![Build Status](https://travis-ci.org/Ecotrust/geosurvey.png?branch=master)](https://travis-ci.org/Ecotrust/geosurvey)

# Server
```bash
vagrant up
fab vagrant bootstrap
fab vagrant createsuperuser
fab vagrand loaddata
fab vagrant runserver
```

## Provision a fresh Server with Chef and Fabric
Create a node file with the name scripts/cookbook/node_staging.json from the template in scripts/cookbook/node_staging.json.template.  Set the postgresql password and add your ssh public key to scripts/node_staging.json.  Tested with Ubuntu 12.04 (precise pangolin).

These commands install all the prerequisites for running marine planner, including postgresql/postgis, python and all the required modules in a virtual environment as well as gunicorn and nginx to serve the static files.

```bash
fab staging:root@hostname prepare
fab staging:username@hostname deploy
```

###Sample config file
```javascript
{
    "user": "www-data",
    "servername": "staging.example.com",
    "dbname": "marine-planner",
    "staticfiles": "/usr/local/apps/marine-planner/mediaroot",
    "mediafiles": "/usr/local/apps/marine-planner/mediaroot",
    "users": [
        {
            "name": "jsmith",
            "key": "ssh-rsa AAAAB3sdkfjhsdkhjfdjkhfffdj.....fhfhfjdjdfhQ== jsmith@machine.local"
        }
    ],
    "postgresql": {
        "password": {
            "postgres": "some random password here"
        }
    },
    "run_list": [
        "marine-planner::default"
    ]
}
```

After the prepare command runs you will no longer be able to login as root with a password.  The prepare command creates one or more users with sudo access based on the list of users specified in the json file.

# Backing up and restoring databases

```bash
fab staging:eknuth@usvi-test.pointnineseven.com backup_db
fab staging:eknuth@usvi-dev.pointnineseven.com restore_db:backups/2013-11-111755-geosurvey.dump
fab vagrant restore_db:backups/2013-11-111755-geosurvey.dump
fab staging:eknuth@usvi-dev.pointnineseven.com migrate_db
```

# Running Tests

Unit tests will run whenever you save a file:

```bash
grunt c-unit
```

End to end tests will run whenever you save a file:


```bash
grunt c-e2e
```

#Heroku
##requirements
1. Install the heroku toolbelt.
2. Install git > 1.8

##create the heroku app if it doesn't exist
```bash
heroku create appname
```

##login to heroku
```bash
heroku login
```

##set environment vars and install addons.
```bash
heroku config:add DJANGO_SECRET_KEY=SECRET!
heroku addons:add sendgrid
heroku addons:add redistogo
heroku addons:add pgbackups

```

Or run the script from scripts/heroku-env.sh, which is available on google drive for each deployment.

#Deploy

First push the server directory as a subtree from the master branch to heroku.  Then you can use a subtree split to push an alternate branch.

##push the app from the project directory
```bash
git subtree push --prefix server/ heroku master
```

##push an alternate branch from the project directory
```bash
git push heroku `git subtree split --prefix server testbranch`:master
```

##django install
```bash
heroku run python manage.py syncdb --settings=config.environments.heroku
heroku run python manage.py migrate --settings=config.environments.heroku
```

##load some data
```bash
heroku run python manage.py loaddata apps/survey/fixtures/surveys.json --settings=config.environments.heroku
heroku run python manage.py loaddata apps/places/fixtures/marco.json.gz --settings=config.environments.heroku
```

##open the app
```bash
heroku open
```

#manage the heroku database
There is now a management command to capture a backup from heroku and restore it to the vagrant instance.  This will get your development environment up to date with what is currently running on heroku.
```bash
fab vagrant transfer_db
```

##dump a backup
This will dump a compressed binary backup of the current database to a file that can be retrieved as "latest.dump".
```bash
heroku pgbackups:capture
curl -o latest.dump `heroku pgbackups:url`
```

##restore a backup
Transfer the dump file to a web accessible space.  To find the database url, use the pg:info command.
```bash
heroku pg:info
heroku pgbackups:restore HEROKU_POSTGRESQL_WHITE_URL 'http://www.example.org/latest.dump'
```

#Phonegap 3.0
Make sure that you have a recent version of node and install the phonegap node module.
```bash
brew upgrade node
sudo npm install -g phonegap
phonegap create mobile -n DigitalDeck -i com.pointnineseven.digitaldeck
cd mobile && phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-console.git
```

To run the ios simulator
```bash
fab vagrant emulate_ios
```

To build and stage the android app
```bash
fab vagrant package_android_test
```
