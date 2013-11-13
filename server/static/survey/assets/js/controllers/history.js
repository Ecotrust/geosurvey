//'use strict';

angular.module('askApp')
    .controller('HistoryCtrl', function($scope, $http, $routeParams, $location, survey) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';

        $scope.respondents = _.toArray(app.respondents);
        if (app.user) {
            $scope.user = app.user;    
        } else {
            $location.path('/');
        }

        $scope.path = $location.path().slice(1,5);


        $scope.getSubmittedSurveysListFromServer = function() {
            var url = app.server 
                      + '/api/v1/reportrespondant/?user__username__exact=' 
                      + $scope.user.username 
                      + '&limit=0'
                      + '&format=json';
            
            return $http.get(url).error(function (err) {
                console.log(JSON.stringify(err));
                debugger;
            });            
        };


        $scope.getSubmittedSurveysList = function() {
            $scope.getSubmittedSurveysListFromServer()
                .success(function (data) {
                    $scope.respondentList = [];
                    _.each(data.objects, function(respondent, index) {
                        $scope.respondentList.push(respondent);
                    });
                    // console.log($scope.respondentList);
                }).error(function (data) {
                    debugger;
                }); 
        };

        $scope.getSubmittedSurveysList();   
        

});