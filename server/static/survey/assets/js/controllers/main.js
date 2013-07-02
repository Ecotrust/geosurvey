
'use strict';

angular.module('askApp')
  .controller('MainCtrl', function ($scope, $location, $http) {

    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    
    // showForm can be in ['login', 'new-user', 'forgot'];
    $scope.showForm = 'login';

    $scope.toggleForm = function (form) {
        $scope.showForm = form;

    };

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    }

    $scope.createUser = function (user) {
        var url = "/account/createUser";

        $http.post(url, user)
            .success(function () {
                app.user = data.user;
                $scope.saveState();
                $location.path('/surveys');
            })
        .error(function (data) {
          $scope.showError = data;
        });
    };

    $scope.authUser = {};

    $scope.showError = false;
    $scope.showInfo = false;
    $scope.authenticateUser = function (user) {
        var url = "/account/authenticateUser";

        $http({
            method: 'POST',
            url: url,
            data: user,

        })
            .success(function (data) {
                app.user = data.user;
                $scope.saveState();
                $location.path('/surveys');
            })
            .error(function (data) {
                $scope.showError = data;
            });

    };

    $scope.forgotPassword = function (user) {
        var url = "/account/forgotPassword";
        $scope.showInfo = false;
        $http.post(url, user)
            .success(function () {
                $scope.showInfo = 'forgot-user';
            });
    };

  });
