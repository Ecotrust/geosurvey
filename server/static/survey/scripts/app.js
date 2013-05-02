'use strict';

angular.module('askApp', ['ui', 'leaflet-directive', 'ui.bootstrap'])
    .config(function($routeProvider, $httpProvider) {

    $httpProvider.defaults.headers.post = {
        'X-CSRFToken': token,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    $routeProvider.when('/', {
        templateUrl: '/static/survey/views/main.html',
        controller: 'MainCtrl'
    })
    .when('/surveys', {
        templateUrl: '/static/survey/views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })
    .when('/survey/:surveySlug/complete/:uuidSlug', {
      templateUrl: '/static/survey/views/complete.html',
      controller: 'CompleteCtrl'
    })
    .when('/survey/:surveySlug/:questionSlug/:uuidSlug', {
        templateUrl: '/static/survey/views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/survey/:surveySlug/:uuidSlug', {
        templateUrl: '/static/survey/views/landing.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/RespondantList', {
        templateUrl: '/static/survey/views/RespondantList.html',
        controller: 'RespondantListCtrl'
    })
    .when('/RespondantDetail/:uuidSlug', {
      templateUrl: '/static/survey/views/RespondantDetail.html',
      controller: 'RespondantDetailCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
});