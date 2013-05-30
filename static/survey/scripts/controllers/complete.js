'use strict';

angular.module('askApp')
  .controller('CompleteCtrl', function ($scope, $routeParams) {
    $scope.completeView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/complete.html';
  });
