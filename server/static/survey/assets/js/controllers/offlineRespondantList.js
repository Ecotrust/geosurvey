//'use strict';

angular.module('askApp')
    .controller('offlineRespondantListCtrl', function($scope, $http, $routeParams, $location) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';

        $scope.respondents = _.toArray(app.respondents);
        $scope.respondentIndex = app.respondents;        
        if (app.user) {
            $scope.user = app.user;    
        } else {
            $location.path('/');
        }

        if ($routeParams.uuidSlug) {
            $scope.respondent = $scope.respondentIndex[$routeParams.uuidSlug]
        }

        $scope.deleteRespondent = function (respondent) {
            $scope.respondents = _.without($scope.respondents, respondent);
            $scope.saveState();
            $location.path('/respondents');
        }

        $scope.sendRespondent = function (respondent) {
            var url = app.server + '/api/v1/offlinerespondant/';
            _.each(respondent.responses, function (response) {
                var question_uri = response.question.resource_uri;
                response.question = question_uri;
                response.answer_raw = JSON.stringify(response.answer);
            });
            var newRespondent = {
                ts: respondent.ts,
                uuid: respondent.uuid,
                responses: respondent.responses,
                survey: '/api/v1/survey/' + respondent.survey + '/'
            };
            return $http.post(url, newRespondent).error(function (err) {
                alert(JSON.stringify(err));
            });
            
        }   

        $scope.synchronized = [];
        $scope.busy = false;
        $scope.syncronize = function(respondents) {
            var first = _.first(respondents),
                rest = _.rest(respondents);
            $scope.busy = true;
            $scope.sendRespondent(first).success(function (data) {
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

                }
                
            });
        }


        $scope.saveState = function () {
            app.respondents = {};
            _.each($scope.respondents, function (respondent) {
                app.respondents[respondent.uuid] = respondent;
            });
            localStorage.setItem('hapifish', JSON.stringify(app));
        }


        $scope.resume = function(respondent) {
            var url = [
                '/survey',
                respondent.survey,
                _.last(respondent.responses).question.slug,
                respondent.uuid
                ].join('/');
           $location.path(url);
        }
});