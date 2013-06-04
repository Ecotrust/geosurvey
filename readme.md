# Server
```bash
vagrant up
fab dev run_server
```

## to update test server
```bash
fab test update
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

##push the app from the project directory
```bash
git subtree push --prefix server/ heroku master
```

##django install
```bash
heroku run python manage.py syncdb --settings=config.environments.heroku
heroku run python manage.py migrate --settings=config.environments.heroku
```

##load the places database for zoom to
```bash
heroku run python manage.py loaddata apps/places/fixtures/marco.json.gz --settings=config.environments.heroku
```

##open the app
```bash
heroku open
```

