web: python manage.py collectstatic --noinput --settings=config.environments.heroku; python manage.py run_gunicorn 0:$PORT --workers=4 --settings=config.environments.heroku