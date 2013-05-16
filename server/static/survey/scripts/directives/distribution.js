'use strict';

angular.module('askApp')
  .directive('distribution', function ($http) {
    return {
      templateUrl: '/static/survey/views/distributionView.html',
      restrict: 'EA',
      scope: {
          filter: '=filter'
      },

      link: function postLink(scope, element, attrs) {
        //scope.filter.answer_domain = ['a','b'];
      }
    };
  });
