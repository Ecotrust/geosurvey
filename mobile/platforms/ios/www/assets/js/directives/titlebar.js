
angular.module('askApp')
    .directive('titlebar', function() {

    return {
        templateUrl: 'views/mobileHeader.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: false,
        link: function (scope, element, attrs) {

            scope.lastQuestion = scope.getLastQuestion ? scope.getLastQuestion() : false;
            scope.back = function () {
                var scope = this;
                scope.gotoQuestion(scope.lastQuestion.slug);
            }
        }
    }
});