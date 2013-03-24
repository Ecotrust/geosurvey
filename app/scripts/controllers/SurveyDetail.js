'use strict';

angular.module('askApp')
  .controller('SurveyDetailCtrl', function ($scope, $routeParams, $http) {
  	
  	$http.get('surveys/' + $routeParams.surveySlug + '.json').success(function(data) {
	  	  $scope.survey = data;
	  	  $scope.question = _.find($scope.survey.questions, function (question) {
	  	  	return question.slug === $routeParams.questionSlug;
	  	  });
	  	});
    
  	$scope.answerQuestion = function () {
  		var url = 'surveys/answer';
  		$http.post(url, {
  			'survey': $scope.survey.slug,
  			'question': $scope.question.slug,
  			'answer': $scope.answer 
  		}).success(function (data) {

  		});
  	}

  });
