
angular.module('askApp')
  .controller('MainCtrl', ['$scope', '$location', '$http', 'storage', function MainCtrl($scope, $location, $http, storage) {
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $scope.path = 'home';
    
    if (app.user) {
        $scope.user = app.user;
    } else {
        $scope.user = false;
        if ($location.path() === '/signin' || $location.path() === '/signup') {
            
        } else {
            $location.path('/');
        }        
    }

    if (app.user && app.user.resumePath) {
        if ( ! _.has(app.respondents, _.last(app.user.resumePath.split('/'))) ) {
            delete $scope.user.resumePath;
        }
    }

    if ($location.path() === '/signup' && $scope.user.status === 'signup') {
        $scope.newUser = app.offlineUser;
    } else if ($location.path() === '/signin' && $scope.user.status === 'signin') {
        $scope.authUser = app.offlineUser;
    }
    
    $scope.version = app.version;
    $scope.stage = app.stage;
    
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
    
    $scope.updateApp = function () {
        var ref = window.open(app.server + '/downloads/update.html', '_blank', 'location=yes');
    }

    $scope.logout = function () {
        app.user = false;
        storage.saveState(app);
        $location.path('/');
    }

    // $scope.saveState = function () {
    //     localStorage.setItem('hapifish', JSON.stringify(app));
    // }

    $scope.offline = function (user, status) {
        app.user = {
            username: user.username,
            status: status,
            offline: true,
            registration: {}
        }
        app.offlineUser = user;
        storage.saveState(app);
        if (status === 'signin') {
            $location.path('/main');    
        } else {
            $location.path('/profile');
        }
        
    };

    $scope.createUser = function (user) {
        var url = app.server + "/account/createUser";
        if (user.emailaddress1 === user.emailaddress2) {
            $scope.working = true;
            $scope.showError = false;
            $http.post(url, user)
                .success(function (data) {
                    app.user = data.user;
                    app.user.registration = {};
                    storage.saveState(app);
                    // $location.path('/surveys');
                    $location.path('/profile');
                })
            .error(function (data, status) {
                $scope.working = false;
                if (status === 0) {
                    app.tempuser = $scope.newUser;
                    $scope.showTempUser = true;
                } else if (data) {
                    $scope.showError = data;    
                } else {
                    $scope.showError = "There was a problem creating an account.  Please try again later."
                }
                
            });    
        } else {
            $scope.showError = "email-mismatch"
        }
        
    };

    $scope.showForgotPassword = false;
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
                app.pw = user.password;
                app.user.registration = JSON.parse(app.user.registration);
                storage.saveState(app);
                if (app.next) {
                    next = app.next;
                    delete app.next;
                    $location.path(app.next);
                } else {
                    $location.path("/main");
                }
                
            })
            .error(function (data, status) {
                if (status === 0) {
                    app.tempuser = $scope.authUser;
                    $scope.working = false;
                    $scope.showTempUser = true;
                } else {
                    $scope.showError = data;
                    $scope.working = false;    
                }
                
            });

    };

    $scope.forgotPassword = function (user) {
        var url = app.server + "/account/forgotPassword";
        
        $http.post(url, user)
            .success(function () {
                $scope.showForgotPassword = false;
                $scope.showForgotPasswordDone = true;
                $scope.showError = false;
                $scope.showInfo = 'forgot-user';
            })
            .error(function (err, status) {
                $scope.showError = err;
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
        storage.saveState(app);
    }

    if (app.message) {
        $scope.message = app.message;
        delete app.message;
        $scope.resizeMap();
    }

    
    
    

  }]);
