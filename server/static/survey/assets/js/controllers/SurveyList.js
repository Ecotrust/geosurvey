//'use strict';

angular.module('askApp')
    .controller('SurveyListCtrl', function($scope, $http, $routeParams, $location) {




    if (app.user ) {
        $scope.user = app.user;    
    } else {
        $location.path('/');
    }
    
    if (app.surveys) {
        $scope.surveys = app.surveys;
        console.log('loading saved surveys');
    } else {
        $scope.updateSurveys();
    }
    


    $scope.updateSurveys = function () {
        $scope.hideSurveys = true;
        $http.get('/api/v1/survey/?format=json').success(function(data) {
            $scope.surveys = data.objects;
            _.each($scope.surveys, function (survey) {
                survey.updated_at = new Date();
            });
            app.surveys = $scope.surveys;
            $scope.saveState();
            $scope.hideSurveys = false;
        })
    }

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    }

});