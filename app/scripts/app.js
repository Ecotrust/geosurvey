'use strict';

angular.module('askApp', [])
    .config(function($routeProvider, $httpProvider) {

    $httpProvider.defaults.headers.post = {
        'X-CSRFToken': token,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    $routeProvider.when('/', {
        templateUrl: '/survey/views/main.html',
        controller: 'MainCtrl',
    })
        .when('/surveys', {
        templateUrl: '/survey/views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })
        .when('/survey/activity-locations/:questionSlug', {
        templateUrl: '/survey/views/mapView.html',
        controller: 'MapViewCtrl'
    })

        .when('/survey/:surveySlug/:questionSlug/:uuidSlug', {
        templateUrl: '/survey/views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
    })
        .when('/survey/:surveySlug/:uuidSlug', {
        templateUrl: '/survey/views/landing.html',
        controller: 'LandingCtrl'
    })
        .when('/RespondantList', {
          templateUrl: '/survey/views/RespondantList.html',
          controller: 'RespondantListCtrl'
        })
        .otherwise({
        redirectTo: '/'
    });
});