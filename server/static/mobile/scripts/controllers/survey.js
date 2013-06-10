'use strict';

angular.module('mobileApp')
    .controller('SurveyCtrl', function($scope, $routeParams, server) {
    
    $scope.survey = server.getSurvey($routeParams.surveySlug);
     
    $scope.survey.then(function (survey) {
        $scope.question = survey.questions[0];
    });

    $scope.answerQuestion = function (answer, otherAnswer) {
        debugger;
    }

  });
