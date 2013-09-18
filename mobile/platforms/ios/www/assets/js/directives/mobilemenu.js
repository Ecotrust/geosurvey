
angular.module('askApp')
    .directive('mobilemenu', function() {

    return {
        templateUrl: 'views/mobileMenu.html',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: false,
        link: function (scope, element, attrs) {
        }
    }
});