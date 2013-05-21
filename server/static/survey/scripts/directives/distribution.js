'use strict';

angular.module('askApp')
    .directive('distribution', function($http) {
    return {
        templateUrl: '/static/survey/views/distributionView.html',
        restrict: 'EA',
        // replace: true,
        transclude: true,
        scope: {
            filter: '=filter',
            question: "=question",
            surveySlug: "=surveySlug"
        },

        link: function postLink(scope, element, attrs) {
            scope.distributionData = [];
            scope.gridOptions = {
                data: 'distributionData'
            };

            scope.$watch('filter', function (newFilter) {
                scope.getData(scope.question.slug, scope.question.options_from_previous_answer, newFilter);
            });


            scope.getData = function (questionSlug, filterQuestionSlug, filterValue) {
                var url = '/reports/distribution/washington-opt-in/' + questionSlug;
                if (filterQuestionSlug && filterValue) {
                    url += '?filter_question=' + filterQuestionSlug;
                    url += '&filter_value=' + filterValue;
                }
                $http.get(url).success(function(data) {
                    scope.distributionData = data.answer_domain;
                });
            };
        }
    };
});