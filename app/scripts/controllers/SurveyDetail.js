'use strict';

angular.module('askApp')
  .controller('SurveyDetailCtrl', function ($scope, $routeParams, $http) {
  	
  	$http.get('surveys/' + $routeParams.surveySlug + '.json').success(function(data) {
	  	  $scope.survey = data;
	  	  $scope.question = _.find($scope.survey.questions, function (question) {
	  	  	return question.slug === $routeParams.questionSlug;
	  	  });
	  	});
    
  });
