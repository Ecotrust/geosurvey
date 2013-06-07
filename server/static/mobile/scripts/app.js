'use strict';

angular.module('mobileApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/surveys', {
        templateUrl: 'views/surveys.html',
        controller: 'SurveysCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
