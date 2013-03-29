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
      .when('/survey/:surveySlug/:questionSlug', {
        templateUrl: 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
      })
      .when('/map/mapView', {
        templateUrl: 'views/mapView.html',
        controller: 'MapViewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
