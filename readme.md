# Install Requirements
```bash
npm install -g yo grunt-cli bower
npm install && bower install --dev
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


# Starting a new angular app
Not required for this project:
```bash
npm install generator-angular generator-karma
```
