'use strict';

var app = {};
console.log(static_url);

angular.module('askApp', ['ui', 'leaflet.directive', 'ui.bootstrap', 'ngGrid'])
    .config(function($routeProvider, $httpProvider) {

    $httpProvider.defaults.headers.post = {
        'X-CSRFToken': token,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };


    $routeProvider.when('/', {
        templateUrl: static_url + 'survey/views/main.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/author/:surveySlug', {
      templateUrl: static_url + 'survey/views/author.html',
      controller: 'AuthorCtrl'
    })
    .when('/surveys', {
        templateUrl: static_url + 'survey/views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })
    .when('/survey/:surveySlug/complete/:uuidSlug', {
      templateUrl: static_url + 'survey/views/complete.html',
      controller: 'CompleteCtrl'
    })
    .when('/survey/:surveySlug/complete/:uuidSlug/:action/:questionSlug', {
      templateUrl: static_url + 'survey/views/complete.html',
      controller: 'CompleteCtrl'
    })
    .when('/survey/:surveySlug/:questionSlug/:uuidSlug', {
        templateUrl: static_url + 'survey/views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/survey/:surveySlug/:uuidSlug', {
        templateUrl: static_url + 'survey/views/landing.html',
        controller: 'SurveyDetailCtrl'
    })
    .when('/RespondantList/:surveySlug', {
        templateUrl: static_url + 'survey/views/RespondantList.html',
        controller: 'RespondantListCtrl'
    })
    .when('/RespondantDetail/:surveySlug/:uuidSlug', {
      templateUrl: static_url + 'survey/views/RespondantDetail.html',
      controller: 'RespondantDetailCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
});