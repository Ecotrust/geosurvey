'use strict';

angular.module('askApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
      })
      .when('/surveys', {
        templateUrl: 'views/SurveyList.html',
        controller: 'SurveyListCtrl'
      })
      .when('/survey/activity-locations/:questionSlug', {
        templateUrl: 'views/mapView.html',
        controller: 'MapViewCtrl'
      })
      .when('/survey/:surveySlug/:questionSlug/:uuidSlug', {
        templateUrl: 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
      })
      .when('/survey/:surveySlug/:uuidSlug', {
        templateUrl: 'views/landing.html',
        controller: 'LandingCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
