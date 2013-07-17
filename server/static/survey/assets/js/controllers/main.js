
angular.module('askApp')
  .controller('MainCtrl', function ($scope, $location, $http) {
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $scope.path = 'home';
    
    if (app.user) {
        $scope.user = app.user;
    } else {
        $scope.user = false;
    }

    // showForm can be in ['login', 'new-user', 'forgot'];
    $scope.showForm = 'login';

    $scope.toggleForm = function (form) {
        $scope.showForm = form;

    };

    $scope.logout = function () {
        app.user = false;
        $scope.saveState();
        window.location.reload();
    }

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    }

    $scope.createUser = function (user) {
        var url = app.server + "/account/createUser";

        $http.post(url, user)
            .success(function (data) {
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
        var url = app.server + "/account/authenticateUser";

        $http({
            method: 'POST',
            url: url,
            data: user,

        })
            .success(function (data) {
                var next;
                app.user = data.user;
                $scope.saveState();
                if (app.next) {
                    next = app.next;
                    console.log(next);
                    delete app.next;
                    $location.path(app.next);
                } else {
                    $location.path('/surveys');    
                }
                
            })
            .error(function (data) {
                $scope.showError = data;
            });

    };

    $scope.forgotPassword = function (user) {
        var url = app.server + "/account/forgotPassword";
        $scope.showInfo = false;
        $http.post(url, user)
            .success(function () {
                $scope.showInfo = 'forgot-user';
            });
    };

  });
