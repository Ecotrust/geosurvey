// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'server/static/survey/assets/lib/js/jquery-1.8.2.min.js',
  'server/static/survey/assets/lib/js/angular.js',
  'server/static/survey/components/angular-mocks/angular-mocks.js',
  'server/static/survey/assets/lib/js/underscore.js',
  'server/static/survey/assets/lib/js/underscore.string.js',
  // 'app/components/angular/angular.js',
  'server/static/survey/assets/lib/js/ng-grid.min.js',
  'server/static/survey/assets/lib/js/angular-ui.js',
  // 'app/components/angular-ui/build/angular-ui.js',
  'test/fixtures/*.js',
  'test/mock/**/*.js',
  'server/static/survey/assets/js/*.js',
  'server/static/survey/assets/js/**/*.js',
  'server/static/survey/assets/js/**/**/*.js',
  
  'test/spec/**/*.js'
];

// list of files to exclude
exclude = [];

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['progress'];

// web server port
port = 8081;

// cli runner port
runnerPort = 9101;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 10000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
