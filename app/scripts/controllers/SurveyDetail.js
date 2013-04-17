'use strict';

angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, offlineSurvey) {

    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        $scope.question = _.find($scope.survey.questions, function(question) {
            return question.slug === $routeParams.questionSlug;
        });

        $scope.nextQuestionPath = ['survey', $scope.survey.slug, $scope.getNextQuestion(), $routeParams.uuidSlug].join('/');

        if ($scope.question.type === 'map-multipoint') {
            $scope.map = {
                center: { lat: 42.505, lng: -122.59 },
                zoom: 6,
                mark: {
                       visibility: true,
                       lat: 42.505,
                       lng: -122.59,

                    },
                msg: null
            }

        }

    });

    $scope.addMarker = function () {
        $scope.map.mark.visibility = true;
    }

    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];

        return nextQuestion ? nextQuestion.slug: null;
    };

    $scope.answerQuestion = function(answer) {
        var url = ['/respond/answer',$scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/'),
            nextQuestion = $scope.getNextQuestion(), nextUrl;

        if (nextQuestion) {
            nextUrl = ['survey', $scope.survey.slug, nextQuestion, $routeParams.uuidSlug].join('/');
        } else {
            nextUrl = ['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/');
        }

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

});