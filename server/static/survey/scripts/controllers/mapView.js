'use strict';

angular.module('askApp')
    .controller('MapViewCtrl', function($scope, $routeParams, $http, $location) {

        
    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        $scope.question = _.find($scope.survey.questions, function(question) {
            return question.slug === $routeParams.questionSlug;
        });

        $scope.nextQuestionPath = ['survey', $scope.survey.slug, $scope.getNextQuestion(), $routeParams.uuidSlug].join('/');

    });


});