'use strict';

angular.module('askApp')
  .controller('SurveyDetailCtrl', function ($scope, $routeParams, $http) {
  	
  	$http.get('surveys/' + $routeParams.surveySlug + '.json').success(function(data) {
	  	  $scope.survey = data;
	  	  $scope.question = $scope.survey.questions[0];
	  	});
    
  });
