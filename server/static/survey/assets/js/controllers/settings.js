//'use strict';

angular.module('askApp')
  .controller('SettingsCtrl', function ($scope, $location) {

    if (app.user) {
        $scope.user = app.user;
    } else {
        $location.path('/');
    }
    $scope.path = 'sett';
    $scope.clearCache = function () {
        localStorage.removeItem('hapifish');
        window.location.reload();
    }
    
  });
