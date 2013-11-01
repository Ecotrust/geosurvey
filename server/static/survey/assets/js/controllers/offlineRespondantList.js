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

        $scope.getTitle = function() {
            try {
                var island = _.findWhere($scope.respondent.responses, {question: 'island'}).answer.text,
                    title = 'USVI Commercial Catch Report Form - ' + island;  
            } catch(e) {
                var title = 'USVI Commercial Catch Report Form';
            }
            return title;
        };

        $scope.gearTypeIncludes = function(type) {
            try { 
                var gearTypes = _.pluck(_.findWhere($scope.respondent.responses, {question: 'gear-type'}).answer, 'label');

                if ( gearTypes.join().indexOf(type) !== -1 ) {
                    return true;
                } 
            } catch(e) {
                return '';
            }
        };

        $scope.trapTypeIncludes = function(type) {
            try { 
                var gearTypes = _.pluck(_.findWhere($scope.respondent.responses, {question: 'gear-type'}).answer, 'label');  
                if ( gearTypes.join().indexOf(type) !== -1 ) {
                    return true;
                } 
            } catch(e) {
                return '';
            }
        };

        $scope.getAnswer = function(questionSlug) {
            try {
                if (questionSlug === 'weight-line-or-reel' || questionSlug === 'weight-traps' || questionSlug === 'weight-nets' || questionSlug === 'weight-spear-or-by-hand') {
                    var island = _.findWhere($scope.respondent.responses, {question: 'island'}).answer.label,
                        islandSlug = (island === 'st-thomas') ? 'st-thomas-st-john' : island,
                        answer = _.findWhere($scope.respondent.responses, {question: questionSlug + '-' + islandSlug}).answer;

                    // TODO: currently no way of determining definitively whether answers are from a grouped multi-select or an ungrouped multi-select
                    // (no groupName may present because either just Others were selected, or no groups were present)
                    // seems like solution would be to ensure selections that were grouped under Other heading should be marked as such...                    
                    _.each(answer, function(obj, index) {
                        if (index === 0 && obj.groupName) {
                            obj.showGroupName = obj.groupName;
                        } else if (obj.groupName && obj.groupName !== answer[index-1].showGroupName) {
                            obj.showGroupName = obj.groupName;
                        } else if (obj.other && answer[index-1].showGroupName !== 'Other') {
                            obj.showGroupName = 'Other';
                        } else {
                            obj.showGroupName = undefined;
                        }
                    });
                } else if (questionSlug === 'trip-landing-site') {
                    var island = _.findWhere($scope.respondent.responses, {question: 'island'}).answer.label,
                        answer = _.findWhere($scope.respondent.responses, {question: questionSlug + '-' + island}).answer;                    
                } else if (questionSlug === 'days-soaked-lobster-traps') {                    
                    var unit = _.findWhere($scope.respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.unit,
                        value = _.findWhere($scope.respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.value;
                    if (unit.toLowerCase().trim() === 'days') {
                        return value;
                    } else {
                        return  Math.floor(value / 24);
                    }
                } else if (questionSlug === 'hours-soaked-lobster-traps') {                    
                    var unit = _.findWhere($scope.respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.unit,
                        value = _.findWhere($scope.respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.value;
                    if (unit.toLowerCase().trim() === 'hours') {
                        return value % 24;
                    } else {
                        return  0;
                    }
                } else if (questionSlug === 'days-soaked-fish-traps') {                    
                    var unit = _.findWhere($scope.respondent.responses, {question: 'time-soaked-fish-traps'}).answer.unit,
                        value = _.findWhere($scope.respondent.responses, {question: 'time-soaked-fish-traps'}).answer.value;
                    if (unit.toLowerCase().trim() === 'days') {
                        return value;
                    } else {
                        return  Math.floor(value / 24);
                    }
                } else if (questionSlug === 'hours-soaked-fish-traps') {                    
                    var unit = _.findWhere($scope.respondent.responses, {question: 'time-soaked-fish-traps'}).answer.unit,
                        value = _.findWhere($scope.respondent.responses, {question: 'time-soaked-fish-traps'}).answer.value;
                    if (unit.toLowerCase().trim() === 'hours') {
                        return value % 24;
                    } else {
                        return  0;
                    }
                } else {
                    var answer = _.findWhere($scope.respondent.responses, {question: questionSlug}).answer;
                }
                
            } catch(e) {
                var answer = '';
            }
            if (answer === 'NA') {
                answer = '';
            }
            return answer;
        };


        $scope.deleteRespondent = function (respondent) {
            $scope.respondents = _.without($scope.respondents, respondent);
            $scope.saveState();
            $location.path('/respondents');
        };

        $scope.sendRespondent = function (respondent) {
            var url = app.server + '/api/v1/offlinerespondant/';
            _.each(respondent.responses, function (response) {
                var question_uri = response.question.resource_uri;
                response.question = question_uri;
                response.answer_raw = JSON.stringify(response.answer);
            });
            var newRespondent = {
                ts: respondent.ts,
                uuid: respondent.uuid.replace(':', '_'),
                responses: respondent.responses,
                status: respondent.status,
                complete: respondent.complete,
                survey: '/api/v1/survey/' + respondent.survey + '/'
            };
            return $http.post(url, newRespondent).error(function (err) {
                console.log(JSON.stringify(err));
            });
            
        }; 

        $scope.synchronized = [];
        $scope.busy = false;
        $scope.syncronize = function(respondents) {
            var completed = _.filter(respondents, function (respondent) { return respondent.complete });
            var first = _.first(completed),
                rest = _.rest(completed);
            $scope.confirmSubmit = false;
            if (completed.length) {
                $scope.busy = true;

                _.each(first.responses, function (response) {
                    if (response.question.grid_cols) {
                        _.each(response.question.grid_cols, function (grid_col) {
                            grid_col.label = grid_col.label.replace(/-/g, '');
                        });
                    }
                });

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
            
        };


        $scope.saveState = function () {
            app.respondents = {};
            _.each($scope.respondents, function (respondent) {
                app.respondents[respondent.uuid] = respondent;
            });
            localStorage.setItem('hapifish', JSON.stringify(app));
        };


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
        };

        // $scope.getSubmittedSurveys = function (respondents) {
            
        //     //var url = app.server + '/api/v1/offlinerespondant/';
        //     var url = app.server + '/api/v1/reportrespondant/?user__username__exact=sfletche&format=json&survey__slug__exact=did-not-fish&limit=1';
            
        //     debugger;

        //     var responses = angular.copy(respondent.responses);
            
        //     _.each(responses, function (response) {
        //         // var question_uri = response.question.resource_uri;
        //         var question_uri = survey.getQuestionUriFromSlug(response.question);
        //         response.question = question_uri;
        //         response.answer_raw = JSON.stringify(response.answer);
        //     });
        //     var newRespondent = {
        //         ts: respondent.ts,
        //         uuid: respondent.uuid.replace(':', '_')
        //     };
        //     return $http.post(url, newRespondent).error(function (err) {
        //         console.log(JSON.stringify(err));
        //     });
            
        // };       


        // $scope.showSubmittedSurveys = function(respondents) {
            
        //     $scope.getSubmittedSurveys(respondents)
        //         .success(function (data) {
        //             debugger;
        //         }).error(function (data) {
        //             debugger;
        //         });    

        // };

});