//'use strict';

angular.module('askApp')
  .controller('SettingsCtrl', function ($scope, $location, $http) {

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
    
    $scope.updateUser = function (user) {
        var url = app.server + "/account/updateUser";

        $http.post(url, user)
            .success(function (data) {
                app.user = data.user;
                $scope.saveState();
                $scope.editProfile = false;
                $scope.changesSaved = true;
            })
        .error(function (data) {
          $scope.showError = data;
        });
    };

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    };

  });
