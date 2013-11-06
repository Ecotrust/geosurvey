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

        $scope.showingSubmittedSurveys = false;

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
                        } else if (obj.groupName && obj.groupName !== answer[index-1].groupName) {
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

        $scope.closeRespondents = function () {
            _.each($scope.respondentList, function(respondent, index) {
                respondent.open = false;
            });
        }

        $scope.openRespondent = function (respondent) {
            if (respondent.open) {
                respondent.open = false;
            } else {
                $scope.closeRespondents();
                respondent.open = true;
            }
            // respondent.open = !respondent.open;
            $scope.respondent = respondent;
        };

        $scope.getSubmittedSurveys = function () {
            //debugger;
            //var url = app.server + '/api/v1/offlinerespondant/';
            var url = app.server 
                      + '/api/v1/reportrespondant/?user__username__exact=' 
                      + $scope.user.username 
                      + '&format=json';
            
            $scope.loading = true;

            return $http.get(url).error(function (err) {
                console.log(JSON.stringify(err));
                debugger;
            });
            
        };       


        $scope.showSubmittedSurveys = function() {
            
            $scope.getSubmittedSurveys()
                .success(function (data) {
                    //debugger;
                    $scope.respondentList = [];
                    _.each(data.objects, function(respondent, index) {
                        try {
                            if (typeof(respondent.responses.question) !== 'string') {
                                _.each(respondent.responses, function(response, index) {
                                    var questionSlug = response.question.slug;
                                    try {
                                        answer_raw = JSON.parse(response.answer_raw);
                                        // console.log('parsed answer_raw: ' + answer_raw);
                                    } catch(e) {
                                        console.log('failed to parse answer_raw');
                                        answer_raw = response.answer;
                                    }
                                    response.question = questionSlug;
                                    response.answer = answer_raw;
                                });
                            }
                            respondent.survey = respondent.survey_slug;
                            respondent.open = false;
                            $scope.respondentList.push(respondent);
                        }
                        catch(e) {
                            debugger;
                        }
                    });

                    $scope.loading = false;

                    //$scope.respondent = respondent;
                    $scope.showingSubmittedSurveys = true;
                }).error(function (data) {
                    debugger;
                });    

        };

});