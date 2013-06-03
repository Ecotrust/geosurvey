'use strict';

angular.module('askApp')
    .controller('RespondantListCtrl', function($scope, $http, $routeParams) {
    $http.get('/api/v1/surveyreport/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;
        
        $scope.$watch('filters', function (newFilters) {
            console.log(newFilters);
        
        }, true);

        _.each($scope.survey.questions, function (question) {
            // save a reference to filter questions which are specified by uri
            question.filters = {};
            if (question.visualize && question.filter_questions) {
                question.filterQuestions = [];
                _.each(question.filter_questions, function (filterQuestion) {
                    question.filterQuestions.push($scope.getQuestionByUri(filterQuestion));
                });

            }

        });

    }).success(function() {
        $http.get('api/v1/respondant/?format=json&limit=5&survey__slug__exact=' + $routeParams.surveySlug).success(function(data) {
            $scope.respondants = data.objects;
            $scope.meta = data.meta;
        });
    });

    $scope.getQuestionByUri = function (uri) {
        return _.findWhere($scope.survey.questions, {'resource_uri': uri});
    };

    $scope.getQuestionBySlug = function (slug) {
		return _.findWhere($scope.survey.questions, {'slug': slug});
    };
});