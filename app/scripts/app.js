'use strict';

angular.module('askApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
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
      .when('/survey/:surveySlug/:questionSlug', {
        templateUrl: '/survey/views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
