//'use strict';

angular.module('askApp')
    .controller('offlineRespondantListCtrl', function($scope, $http, $routeParams, $location, survey) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';

        $scope.respondents = _.toArray(app.respondents);
        $scope.respondentIndex = app.respondents;        
        if (app.user) {
            $scope.user = app.user;    
        } else {
            $location.path('/');
        }

        $scope.path = $location.path().slice(1,5);


        if ($routeParams.uuidSlug) {
            $scope.respondent = $scope.respondentIndex[$routeParams.uuidSlug];

            _.each($scope.respondent.responses, function (response) {
                if (response.question.grid_cols) {
                    _.each(response.question.grid_cols, function (grid_col) {
                        grid_col.label = grid_col.label.replace(/-/g, '');
                    });
                }
            });
        }



        $scope.deleteRespondent = function (respondent) {
            $scope.respondents = _.without($scope.respondents, respondent);
            $scope.saveState();
            $location.path('/respondents');
        }

        $scope.synchronized = [];
        $scope.busy = false;
        $scope.syncronize = function(respondents) {
            var completed = _.filter(respondents, function (respondent) { return respondent.complete });
            var first = _.first(completed),
                rest = _.rest(completed);
            $scope.confirmSubmit = false;
            if (completed.length) {
                $scope.busy = true;
                survey.submitSurvey(first, _.findWhere(app.surveys, { slug: first.survey})).success(function (data) {
                    $scope.synchronized.push(data);
                    if (rest.length) {
                        $scope.syncronize(rest);
                    } else {
                        $scope.busy = false;

                        _.each($scope.synchronized, function (synced) {
                            var original = _.findWhere($scope.respondents, { uuid: synced.uuid})
                            $scope.respondents.splice(_.indexOf($scope.respondents, original));
                            $scope.saveState();
                        })
                        $scope.synchronized = [];
                        delete app.message;
                    }
                    
                });    
            }
            
        }


        $scope.saveState = function () {
            app.respondents = {};
            _.each($scope.respondents, function (respondent) {
                app.respondents[respondent.uuid] = respondent;
            });
            localStorage.setItem('hapifish', JSON.stringify(app));
        }


        $scope.resume = function(respondent) {
            var url;
            if (respondent.responses.length) {
                url = respondent.resumePath.replace('#', '');
            } else {
                url = [
                    '/survey',
                    respondent.survey,
                    1,
                    respondent.uuid
                ].join('/');
            }
            
           $location.path(url);
        }
});