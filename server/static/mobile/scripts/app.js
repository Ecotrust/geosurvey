'use strict';

angular.module('mobileApp', ['restangular', 'serverService', 'ngResource'])
  .config(function ($routeProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl("/api/v1");
    RestangularProvider.setDefaultRequestParams('?format=json');
    RestangularProvider.setListTypeIsArray(false);

    RestangularProvider.setResponseExtractor(function(response, operation) {
      // Only for lists
      if (operation === 'getList') {
        if (response && response.objects) {
          return response.objects;  
        }
      }
      return response;
    });

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/surveys', {
        templateUrl: 'views/surveys.html',
        controller: 'SurveysCtrl'
      })
      .when('/survey/:surveySlug/:questionSlug', {
        templateUrl: 'views/survey.html',
        controller: 'SurveyDetailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
