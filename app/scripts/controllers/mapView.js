'use strict';

angular.module('askApp')
  .controller('MapViewCtrl', function ($scope, $routeParams, $http, $location, offlineSurvey) {
  	
  	$http.get('surveys/activity-locations.json').success(function(data) {
	  	  $scope.survey = data;
	  	  $scope.question = _.find($scope.survey.questions, function (question) {
	  	  	return question.slug === $routeParams.questionSlug;
	  	  });
	  	});

    $scope.getNextQuestion = function () {
      // should return the slug of the next question
      var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions,$scope.question)+1];

      return nextQuestion.slug;
    };

  	$scope.answerQuestion = function () {
  		var url = 'surveys/answer',
        nextUrl = ['survey', $scope.survey.slug, $scope.getNextQuestion()].join('/');

      if ($scope.survey.offline) {
        offlineSurvey.answerQuestion($scope.survey, $scope.question, $scope.answer);
      } else {
        $http.post(url, {
          'survey': $scope.survey.slug,
          'question': $scope.question.slug,
          'answer': $scope.answer 
        }).success(function (data) {

        });  
      }
      $location.path(nextUrl);
  		
  	};

    $scope.loadMap = function () {
      setTimeout(function () {

        var map = new OpenLayers.Map({
          div: "map",
          layers: [new OpenLayers.Layer.OSM()],
          controls: [
              new OpenLayers.Control.Navigation({
                  dragPanOptions: {
                      enableKinetic: true
                  }
              }),
              new OpenLayers.Control.Attribution(),
              new OpenLayers.Control.Zoom()
          ],
          center: [0, 0],
          zoom: 1
        });
      }, 0);
    };

  });
