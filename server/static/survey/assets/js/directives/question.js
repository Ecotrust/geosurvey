
'use strict';

(function() {
    var questionDirective = angular.module('question.directive', []);

    questionDirective.directive('question', function($) {

        return {
            templateUrl: '/static/survey/views/questionTypes.html',
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                questionsrc: "=questionsrc"
            },
            link: function postLink(scope, element, attrs) {
                console.log(scope.question);
            }
        }
    });

})();