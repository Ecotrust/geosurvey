angular.module('askApp')
    .directive('profilefields', function($log) {
    return {
        templateUrl: '/static/survey/views/ProfileFields.html',
        restrict: 'EA',
        replace: true,        
        transclude: true,
        scope: {
            user: '=user'
        },
        link: function postLink(scope, element, attrs) {
            scope.user.registration = JSON.parse(scope.user.registration);
        }
    };
});