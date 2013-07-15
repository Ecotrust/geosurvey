//'use strict';

if (localStorage.getItem('hapifish')) {
    app = JSON.parse(localStorage.getItem('hapifish'));
    console.log(app);
} else {
    var app = {};    
}
if (_.string.startsWith(window.location.protocol, "http")) {
    app.server = window.location.protocol + "//" + window.location.host;
} else {
    app.server = "https://APP_SERVER";
}

console.log(app.server);

angular.module('askApp', ['ui', 'ui.bootstrap', 'ngGrid'])
    .config(function($routeProvider, $httpProvider) {

    if (typeof token != 'undefined') {
        $httpProvider.defaults.headers.post['X-CSRFToken'] = token;
    }

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false

    })
        .when('/author/:surveySlug', {
        templateUrl: 'views/author.html',
        controller: 'AuthorCtrl'
    })
        .when('/surveys', {
        templateUrl: 'views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })

        .when('/survey/:surveySlug/complete/:uuidSlug', {
        templateUrl: 'views/complete.html',
        controller: 'CompleteCtrl'
    })
        .when('/survey/:surveySlug/complete/:uuidSlug/:action/:questionSlug', {
        templateUrl: 'views/complete.html',
        controller: 'CompleteCtrl'
    })
        .when('/survey/:surveySlug/:questionSlug/:uuidSlug', {
        templateUrl: 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
    })
        .when('/survey/:surveySlug/:uuidSlug', {
        templateUrl: 'views/landing.html',
        controller: 'SurveyDetailCtrl'
    })
        .when('/respondents', {
        templateUrl: 'views/offlineRespondantList.html',
        controller: 'offlineRespondantListCtrl'
    })
        .when('/respondent/:uuidSlug', {
        templateUrl: 'views/completedSurveys.html',
        controller: 'offlineRespondantListCtrl'
    })
        .when('/RespondantList/:surveySlug', {
        templateUrl: 'views/RespondantList.html',
        controller: 'RespondantListCtrl'
    })
        .when('/RespondantDetail/:surveySlug/:uuidSlug', {
        templateUrl: 'views/RespondantDetail.html',
        controller: 'RespondantDetailCtrl'
    })
        .when('/survey', {
        templateUrl: 'views/survey.html',
        controller: 'SurveyCtrl'
    })
        .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
    })
        .otherwise({
        redirectTo: '/'
    });
});
