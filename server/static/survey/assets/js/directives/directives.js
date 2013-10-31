
angular.module('askApp')
    .directive('password', function() {

    return {
        templateUrl: app.viewPath + 'views/password.html',
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            passwordText: "=passwordText",
            placeholderText: "=placeholderText"
        },
        link: function (scope, element, attrs) {
            scope.visible = false;
            scope.element = element;
            
            scope.toggleVisible = function () {
                scope.visible = ! scope.visible;

                // this should set focus, but doesn't work :()
                if (scope.visible) {
                    scope.element.find('input.text')[0].focus();
                } else {
                    scope.element.find('input.dots')[0].focus();
                }
                
            }
        }
    }
});