//'use strict';

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
            scope.filterJSON;
            scope.distributionData = [];
            scope.gridOptions = {
                data: 'distributionData',
                columnDefs: [
                    {field:'answer', displayName:scope.question.label.replace('?','')},
                    {field:'surveys', displayName:'Surveys'},
                    {field:'locations', displayName:'Activity Points'}
                ]
            };

            scope.$watch('filter', function (newFilter) {
                var filter = [];
                
                _.each(newFilter, function (v, k) {
                    var thisFilter = {};
                    
                    if (v.length) {    
                        thisFilter[k] = v;
                        filter.push(thisFilter);
                    }
                });
                
                scope.filterJSON = JSON.stringify(filter);
            }, true);


            scope.$watch('filterJSON', function (newValue) {
                scope.getData(scope.question.slug, scope.surveySlug, newValue);
            }, true);

            scope.getData = function (questionSlug, surveySlug, filters) {
                var url = '/reports/distribution/' + surveySlug + '/' + questionSlug;

                if (filters) {
                    url += '?filters=' + filters;
                    
                }
                $http.get(url).success(function(data) {
                    var locationIdx = {};
                    _.each(data.answer_domain.locations, function (location) {
                        locationIdx[location.answer] = location.locations;
                    });
                    _.each(data.answer_domain.surveys, function (survey) {
                        survey.locations = locationIdx[survey.answer];
                    });
                    scope.distributionData = data.answer_domain;
                });
            };
        }
    };
});
