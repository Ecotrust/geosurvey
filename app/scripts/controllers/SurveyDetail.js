'use strict';

angular.module('askApp')
  .controller('SurveyDetailCtrl', function ($scope, $routeParams, $http) {
  	
  	$http.get('surveys/' + $routeParams.surveyName + '.json').success(function(data) {

	  	  $scope.survey = data;
	  	})
    
  });
