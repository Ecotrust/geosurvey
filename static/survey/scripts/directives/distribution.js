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
            question: "=question"
        },

        link: function postLink(scope, element, attrs) {
            scope.distributionData = [];
            scope.gridOptions = {
                data: 'distributionData'
            };

            //angular.extend(scope.distributionData, scope.question.answer_domain);
            console.log(scope.question);
            scope.$watch('filter', function(newFilter) {
                var url = '/reports/distribution/washington-opt-in/' + scope.question.slug;
                if (newFilter) {
                    url += '?filter_question=' + scope.question.options_from_previous_answer;
                    url += '&filter_value=' + newFilter;
                }
                $http.get(url)
                    .success(function(data) {
                    scope.distributionData = data.answer_domain;
                });
            });


            function getData() {

            };
        }
    };
});