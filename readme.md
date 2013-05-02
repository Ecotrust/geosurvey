# Server
```base
vagrant up
fab dev run_server
```

# Install Requirements
From the geosurvey project directory
```bash
sudo npm install -g yo grunt-cli bower
npm install && bower install --dev
npm install generator-angular generator-karma
```

# Launching Server
Run all of these in seperate tabs/windows

The app will be served on port 9000.  A browser window will open automatically.
```bash
grunt server
```
# Running Tests

With the server running in port 9000, run the following commands for continuous test running.

Unit tests will run whenever you save a file:

```bash
grunt c-unit
```

End to end tests will run whenever you save a file:


```bash
grunt c-e2e
```


# Using the angular app generator

Add a new route, view, controller, unit test:
```bash
yo angular:route myRoute
```

Because the app is being served out of the django app we need to specify a path for the controls and templates.  Here is an axample route:

```javascript
.when('/RespondantDetail', {
  templateUrl: '/static/survey/views/RespondantDetail.html',
  controller: 'RespondantDetailCtrl'
})
```

# Install the heroku toolbelt.
# Install git > 1.8

# Specify Requirements
must have a requirements.txt file in the django project root

# Create a Procfile in django project root to run dev server
web: python manage.py runserver 0:$PORT --settings=config.environments.heroku

# Create an environment (config/environment/heroku.py):
```python
from path import path
from config.settings import *
import dj_database_url

DATABASES = {
    'default': dj_database_url.config()  
}
DEBUG = False

Create the heroku app
heroku create appname

Push the app if it is in a directory
git subtree push --prefix server/ heroku master

Push the app if at project root
git push heroku master

Django install
heroku run python manage.py syncdb --settings=config.environments.heroku
heroku run python manage.py migrate --settings=config.environments.heroku

Open the app
heroku open
```