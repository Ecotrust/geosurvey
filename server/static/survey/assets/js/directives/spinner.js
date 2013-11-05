
angular.module('askApp')
    .directive('loading', function() {

    return {
        template: '<div class="loading-indicator"><h3>{{message}}</h3><div class="bar"><i class="sphere"></i></div></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            message: "=message"
        },
        link: function (scope, element, attrs) {
            
        }
    }
});