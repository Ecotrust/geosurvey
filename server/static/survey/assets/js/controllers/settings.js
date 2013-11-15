//'use strict';

angular.module('askApp')
  .controller('SettingsCtrl', function ($scope, $location, $http, storage) {

    if (app.user) {
        $scope.user = app.user;
    } else {
        $location.path('/');
    }
    $scope.server = app.server;
    
    $scope.path = 'sett';
    $scope.clearCache = function () {
        storage.clearCache();
        window.location.reload();
    }

    $scope.updatePassword = function (passwords) {
        var url = app.server + "/account/updatePassword";
        $scope.showError = false;
        $http.post(url, {username: app.user.username, passwords: passwords})
            .success(function (data) {
                $scope.passwords = null;
                $scope.changingPassword = false;
            })
            .error(function (data) {
              $scope.showError = data;
            });
    }
    
    $scope.updateUser = function (user) {
        var url = app.server + "/account/updateUser";

        $http.post(url, user)
            .success(function (data) {
                app.user = data.user;
                storage.saveState();
                $scope.editProfile = false;
                $scope.changesSaved = true;
            })
            .error(function (data) {
              $scope.showError = data;
            });
    };


  });
