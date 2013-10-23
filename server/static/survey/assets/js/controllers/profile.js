//'use strict';

angular.module('askApp')
  .controller('ProfileCtrl', function ($scope, $routeParams, $http, $location) {
    //$http.defaults.headers.post['Content-Type'] = 'application/json';
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';


    $scope.loaded=false;
    $scope.width = 0;
    // QUESTION - something causes this to be called for SurveyList, but I'm not sure what that something is...
    // ...manually calling updateSurveys here (see if app.surveys below)
    var updateSurveys = function () {
        $scope.hideSurveys = true;
        $scope.width = 0;
        $scope.timer = setInterval(function () {
            $scope.width = $scope.width + 10;
        }, 500);
        $http.get(app.server + '/api/v1/survey/?format=json').success(function(data) {
            $scope.surveys = data.objects;
            _.each($scope.surveys, function (survey) {
                survey.updated_at = new Date();
            });
            app.surveys = $scope.surveys;
            $scope.saveState();
            $scope.hideSurveys = false;
            $scope.loaded = true;
            clearInterval($scope.timer);
        
            $scope.profileQuestions = getProfileQuestions();
        });

    }

    var getProfileQuestions = function () {
        var profileQuestions = [];
        _.each($scope.surveys, function(survey, i) {
            // QUESTION - why doesn't survey.questions include the profile questions?
            // survey.questions is no longer relevant
            _.each(survey.pages, function(page, j) {
                _.each(page.questions, function(question, k) {
                    if (question.attach_to_profile) {
                        profileQuestions.push(question);
                    } 
                })
            });
        });
        return _.uniq(profileQuestions, false, function(question) {
            return question.slug;
        });
    };

    $scope.validity = {};

    if (app.user) {
        $scope.user = app.user;
        $scope.answers = app.user.registration;
    } else {
        $scope.user = false;
    }
    $scope.path = false;

    if (app.surveys) {
        $scope.surveys = app.surveys;
        $scope.profileQuestions = getProfileQuestions();
    } else {
        updateSurveys();
    }



    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    };

    
    $scope.updateProfile = function (profileQuestions) {
        var url = '/account/updateUser/',
            registration = {};

        _.each(profileQuestions, function(item, i) {
            registration[item.slug] = item.answer;
        });

        $http.post(url, {username: app.user.username, registration: registration})
            .success(function (data) {
                app.user.registration = registration;
                $scope.saveState();
                $location.path('#/');
            })
            .error(function (data) {
                $scope.working = false;
                if (data) {
                    $scope.showError = data;    
                } else {
                    $scope.showError = "There was a problem creating an account.  Please try again later."
                }            
            });
    };

    
  });
