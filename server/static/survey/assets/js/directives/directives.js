
angular.module('askApp')
    .directive('password', function() {

    return {
        templateUrl: app.viewPath + 'views/password.html',
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            passwordText: "=passwordText"
        },
        link: function (scope, element, attrs) {
            scope.visible = false;
            scope.element = element;
            scope.toggleVisible = function () {
                scope.visible = ! scope.visible;
                if (scope.visible) {
                    scope.element.find('input.text')[0].focus();
                } else {
                    scope.element.find('input.dots')[0].focus();
                }
                
            }
        }
    }
});