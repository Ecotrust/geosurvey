'use strict';

angular.module('askApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/surveys', {
        templateUrl: 'views/SurveyList.html',
        controller: 'SurveyListCtrl'
      })
      .when('/survey/:surveySlug', {
        templateUrl: 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
