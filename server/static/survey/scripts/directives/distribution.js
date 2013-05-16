'use strict';

angular.module('askApp')
  .directive('distribution', function ($http) {
    return {
      templateUrl: '/static/survey/views/distributionView.html',
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
          filter: '=filter',
          question: "=question"
      },

      link: function postLink(scope, element, attrs) {
        scope.gridOptions = { data: 'question.answer_domain' };
        
        scope.$watch('filter', function (newFilter) {
          console.log(newF)
        });
      }
    };
  });
