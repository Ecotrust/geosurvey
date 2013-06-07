'use strict';

angular.module('mobileApp')
  .controller('SurveysCtrl', function ($scope, server) {
    $scope.surveys = server.getSurveys();
  });
