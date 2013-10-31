
angular.module('askApp')
  .controller('MainCtrl', function ($scope, $location, $http) {
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $scope.path = 'home';
    $scope.version = app.version;
    
    if (app.user) {
        $scope.user = app.user;
    } else {
        $scope.user = false;
        console.log($location.path() !== '/signin')
        if ($location.path() === '/signin' || $location.path() === '/signup') {
            console.log('re')
            
        } else {
            $location.path('/');
        }
        
    }
    $scope.version = app.version;
    if (app.version !== "APP_VERSION") {
        
    }
    $scope.update = false;
    $http({
        method: 'GET',
        url: app.server + "/mobile/getVersion"
    })
    .success(function (data) {
        $scope.newVersion = data.version;
        if (app.version < data.version) {
            $scope.update = "An update is available for Digital Deck."
        } else {
            $scope.update = false;
        }
    })
    .error(function (data) {
    });
    
    $scope.passwordType = "password";

    $scope.updateApp = function () {
        var ref = window.open('http://www.labs.ecotrust.org/usvi/update.html', '_blank', 'location=yes');
    }

    // showForm can be in ['login', 'new-user', 'forgot'];
    $scope.showForm = 'login';

    $scope.toggleForm = function (form) {
        $scope.showError = false;
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
        if (user.emailaddress1 === user.emailaddress2) {
            $scope.working = true;
            $scope.showError = false;
            $http.post(url, user)
                .success(function (data) {
                    app.user = data.user;
                    $scope.saveState();
                    // $location.path('/surveys');
                    $location.path('/profile');
                })
            .error(function (data) {
                $scope.working = false;
                if (data) {
                    $scope.showError = data;    
                } else {
                    $scope.showError = "There was a problem creating an account.  Please try again later."
                }
                
            });    
        } else {
            $scope.showError = "email-mismatch"
        }
        
    };

    $scope.authUser = {};

    $scope.showError = false;
    $scope.showInfo = false;
    $scope.working = false;
    $scope.authenticateUser = function (user) {
        var url = app.server + "/account/authenticateUser";
        $scope.working = true;
        $http({
            method: 'POST',
            url: url,
            data: user

        })
            .success(function (data) {
                var next;
                $scope.working=false;
                app.user = data.user;
                app.user.registration = JSON.parse(app.user.registration);
                $scope.saveState();
                if (app.next) {
                    next = app.next;
                    console.log(next);
                    delete app.next;
                    $location.path(app.next);
                } else {
                    console.log('logging in');
                    $location.path("/main");
                }
                
            })
            .error(function (data) {
                $scope.showError = data;
                $scope.working = false;
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

    $scope.resizeMap = function () {
        // if ($scope.message) {
        //     $('#map').height($(window).height() - $('#map').offset().top - $('.alert-notice:visible').height() - 10);    
        // } else {
        //     $('#map').height($(window).height() - $('#map').offset().top);    
        // }
        
    }
    // setTimeout( function () {
    //     $scope.resizeMap();
    //     map.setView([18.35, -66.85], 7);  
    // }, 0)
    

    $(window).on('resize', $scope.resizeMap);

    

    $scope.dismissMessage = function () {
        $scope.message = false;
        $scope.resizeMap();
    }

    if (app.message) {
        $scope.message = app.message;
        delete app.message;
        $scope.resizeMap();
    }

    
    
    

  });
