'use strict';

angular.module('askApp')
  .controller('SurveyListCtrl', function ($scope, $http) {
  	$http.get('/survey/surveys/all.json').success(function(data) {
  	  $scope.surveys = data;
  	})
  });
