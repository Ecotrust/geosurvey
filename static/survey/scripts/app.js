'use strict';

var app = {};


angular.module('askApp', ['ui', 'leaflet.directive', 'ui.bootstrap', 'ngGrid'])
    .config(function($routeProvider, $httpProvider) {

    $httpProvider.defaults.headers.post = {
        'X-CSRFToken': token,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };


    $routeProvider.when('/', {
        templateUrl: '/static/survey/views/main.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/author/:surveySlug', {
      templateUrl: 'static/survey/views/author.html',
      controller: 'AuthorCtrl'
    })
    .when('/surveys', {
        templateUrl: '/static/survey/views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })
    .when('/survey/:surveySlug/complete/:uuidSlug', {
      templateUrl: '/static/survey/views/complete.html',
      controller: 'CompleteCtrl'
    })
    .when('/survey/:surveySlug/complete/:uuidSlug/:action/:questionSlug', {
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
    .when('/RespondantList/:surveySlug', {
        templateUrl: '/static/survey/views/RespondantList.html',
        controller: 'RespondantListCtrl'
    })
    .when('/RespondantDetail/:surveySlug/:uuidSlug', {
      templateUrl: '/static/survey/views/RespondantDetail.html',
      controller: 'RespondantDetailCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
});