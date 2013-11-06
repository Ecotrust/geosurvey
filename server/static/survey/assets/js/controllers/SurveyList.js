//'use strict';

angular.module('askApp')
    .controller('SurveyListCtrl', function($scope, $http, $routeParams, $location) {

    $scope.path = $location.path().slice(1,5);
    $scope.loaded=false;
    $scope.width = 0;

    $scope.useSurveys = function (surveys) {
        $scope.surveys = surveys;
        _.each($scope.surveys, function (survey) {
            survey.updated_at = new Date();
        });
        app.surveys = $scope.surveys;
        $scope.saveState();
        $scope.hideSurveys = false;
        $scope.loaded = true;
        clearInterval($scope.timer);
    }

    $scope.updateSurveys = function () {
        $scope.hideSurveys = true;
        $scope.width = 0;
        $scope.timer = setInterval(function () {
            $scope.width = $scope.width + 10;
        }, 500);
        $http.get(app.server + '/api/v1/survey1/?format=json').success(function(data) {
            $scope.useSurveys(data.objects);
        }).error(function (data, status) {
            
            $http.get('assets/surveys.json').success(function(data) {
                $scope.useSurveys(data.objects);
            });
        });

    }

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
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