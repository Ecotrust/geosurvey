
angular.module('askApp')
    .controller('MobileMenuCtrl', function($scope, $http, $routeParams, $location) {
        $scope.$watch(function () { return $location.path() }, function () {
            $scope.path = $location.path();
        });
});