//'use strict';

angular.module('askApp')
    .controller('SurveyListMenuCtrl', function($scope, $http, $routeParams, $location) {

        $scope.path = $location.path().slice(1, 5);
        $scope.loaded = false;
        $scope.width = 0;
        $scope.updateSurveys = function() {
            $scope.hideSurveys = true;
            $scope.width = 0;
            $scope.timer = setInterval(function() {
                $scope.width = $scope.width + 10;
            }, 500);
            $http.get(app.server + '/api/v1/surveyreport/?format=json').success(function(data) {
                $scope.surveys = data.objects;
                _.each($scope.surveys, function(survey) {
                    survey.updated_at = new Date();
                });
                app.surveys = $scope.surveys;
                $scope.saveState();
                $scope.hideSurveys = false;
                $scope.loaded = true;
                clearInterval($scope.timer);
            })

        }

        if (app.user) {
            $scope.user = app.user;
        } else {
            $location.path('/');
        }

        if (app.surveys) {
            $scope.surveys = app.surveys;
        } else {
            $scope.updateSurveys();
        }



    });