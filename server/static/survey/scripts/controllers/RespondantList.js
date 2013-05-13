'use strict';

angular.module('askApp')
    .controller('RespondantListCtrl', function($scope, $http, $routeParams) {
    $http.get('/api/v1/surveyreport/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        _.each($scope.survey.questions, function(question) {
            if (question.visualize) {
                question.gridOptions = {
                    data: 'question.answer_domain'
                };
            }

        });

    }).success(function() {
        $http.get('api/v1/respondant/?format=json&limit=5&survey__slug__exact=' + $routeParams.surveySlug).success(function(data) {
            $scope.respondants = data.objects;
            $scope.meta = data.meta;
        });
    });
});