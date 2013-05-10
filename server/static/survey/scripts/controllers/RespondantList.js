'use strict';

angular.module('askApp')
  .controller('RespondantListCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
      $scope.survey = data;
    }).success(function () {
    	$http.get('api/v1/respondant/?format=json&limit=0&survey__slug__exact=' + $routeParams.surveySlug).success(function(data) {
    	    $scope.respondants = data.objects;
    	    $scope.meta = data.meta;
    	});
    });
  });
