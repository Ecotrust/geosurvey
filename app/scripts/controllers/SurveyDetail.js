'use strict';

angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, offlineSurvey) {

    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        $scope.question = _.find($scope.survey.questions, function(question) {
            return question.slug === $routeParams.questionSlug;
        });

        $scope.nextQuestionPath = ['survey', $scope.survey.slug, $scope.getNextQuestion(), $routeParams.uuidSlug].join('/');

    });


    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];

        return nextQuestion ? nextQuestion.slug: null;
    };



    $scope.answerQuestion = function(answer) {
        var valid = $scope.validate();
        if (!valid) {
            return;
        }

        var url = ['/respond/answer',$scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/'),
            nextQuestion = $scope.getNextQuestion(),
            nextUrl = ['survey', $scope.survey.slug, nextQuestion, $routeParams.uuidSlug].join('/');

        if ($scope.survey.offline) {
            offlineSurvey.answerQuestion($scope.survey, $scope.question, $scope.answer);
        } else {
            $http({
                url: url,
                method: 'POST',
                data: {"answer": answer},
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data) {
                $location.path(nextUrl);
            });
        }
        

    };

    $scope.validate = function () {
        // Only perform validation for question types that need it.
        if (questionForm && questionForm.integerAnswer) {
            return (questionForm.integerAnswer.validity && questionForm.integerAnswer.validity.valid);
        }
        else {
            return true;
        }   
    };

    $scope.onlyDigits = function($event) {
        console.log("onlyDigits()");
        $event = $event || window.event;
        var charCode = $event.which || $event.keyCode;
        var charStr = String.fromCharCode(charCode);

        if (charCode > 57 ||  charCode < 48) {
          // prevent non-numeric values from showing up
          $event.preventDefault();
          return false;
        }
    };

});