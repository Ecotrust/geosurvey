heroku run python manage.py syncdb --settings=config.environments.heroku
heroku run python manage.py migrate --settings=config.environments.heroku
heroku run python manage.py loaddata apps/survey/fixtures/surveys.json --settings=config.environments.heroku
#heroku run python manage.py loaddata apps/places/fixtures/marco.json.gz --settings=config.environments.heroku