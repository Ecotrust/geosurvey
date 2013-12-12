//'use strict';

angular.module('askApp')
    .controller('unSubmittedSurveyListCtrl', function($scope, $http, $routeParams, $location, survey, history, storage) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';

        $scope.respondents = _.toArray(app.respondents).sort( function(a,b) { return new Date(b.ts).getTime() - new Date(a.ts).getTime();});
        _.each($scope.respondents, function(respondent) {
            respondent.open = false;

            
            if (respondent.survey) {
                var surveyName = _.findWhere(app.surveys, {slug: respondent.survey}).name,
                    date,
                    dateItems; 

                if (respondent.survey === 'catch-report') {
                    try {
                        date = _.findWhere(respondent.responses, {question: 'landed-date'}).answer;
                        dateItems = date.split('-');
                        date = dateItems[1] + '/' + dateItems[2] + '/' + dateItems[0];
                        respondent.survey_title = surveyName + " -- " + date;
                    } catch (e) {
                        respondent.survey_title = surveyName;
                    }
                    
                } else if (respondent.survey === 'did-not-fish') {
                    try {
                        date = _.findWhere(respondent.responses, {question: 'did-not-fish-for-month-of'}).answer;
                        dateItems = date.split('-');
                        date = dateItems[1] + '/' + dateItems[0];
                        respondent.survey_title = surveyName + " -- " + date;
                    } catch (e) {
                        respondent.survey_title = surveyName;
                    }
                    
                } else {
                    respondent.survey_title = respondent.survey;
                }
                
                  
            }
            
        });
        $scope.hasReportsToSubmit = _.any(_.pluck($scope.respondents, 'complete'));
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

        $scope.showSurveyList = true;

        
        $scope.getTitle = function() {
            return history.getTitle($scope.respondent);
        };

        $scope.getAnswer = function(questionSlug) {
            return history.getAnswer(questionSlug, $scope.respondent);
        };


        $scope.gearTypeIncludes = function(type) {
            return history.gearTypeIncludes(type, $scope.respondent);
        };

        $scope.trapTypeIncludes = function(type) {
            return history.trapTypeIncludes(type, $scope.respondent);
        };


        $scope.deleteRespondent = function (respondent) {
            $scope.respondents = _.without($scope.respondents, respondent);
            $scope.saveState();
        };

        $scope.synchronized = [];
        $scope.busy = false;
        $scope.syncronize = function(respondents) {
            var completed = _.filter(respondents, function (respondent) { return respondent.complete });
            var first = _.first(completed),
                rest = _.rest(completed);

            $scope.showSurveyList = false;            
            $scope.confirmSubmit = false;
            $scope.busy = true;
            if (completed.length) {
                survey.submitSurvey(first, _.findWhere(app.surveys, { slug: first.survey })).success(function (data) {
                    if (! data) {
                        $scope.showErrorMessage = true;
                        return false;
                    }
                    $scope.synchronized.push(data);
                    if (rest.length) {
                        $scope.syncronize(rest);
                    } else {
                        $scope.showSurveyList = true;
                        $scope.busy = false;
                        $scope.showSubmitDone = true;
                        _.each($scope.synchronized, function (synced) {
                            var original = _.findWhere($scope.respondents, { uuid: synced.uuid})
                            $scope.respondents.splice(_.indexOf($scope.respondents, original), 1);
                            $scope.saveState();
                        })
                        $scope.synchronized = [];
                        delete app.message;
                    }
                    
                })
                .error(function (err) {
                    debugger;
                });
            }
            
        };


        $scope.saveState = function () {
            app.respondents = {};
            _.each($scope.respondents, function (respondent) {
                app.respondents[respondent.uuid] = respondent;
            });
            storage.saveState(app);
        };

        $scope.deleteSurvey = function(respondent) {
            $scope.deleteRespondent(respondent);
        };

        $scope.resumeSurvey = function(respondent) {
            survey.resume(respondent);
        };

        $scope.submitSurvey = function(respondent) {
            $scope.showSurveyList = false;
            survey.submitSurvey(respondent, _.findWhere(app.surveys, {slug: respondent.survey}))
                .success( function(data) {
                    //remove from app.respondents and save state
                    $scope.deleteRespondent(respondent);
                    $scope.showSurveyList = true;
                }).error( function(err) {
                    debugger;
                });
            
        };

        $scope.closeRespondents = function () {
            _.each($scope.respondents, function(respondent, index) {
                respondent.open = false;
            });
        };

        $scope.openRespondent = function (respondent) {
            if (respondent.open) {
                respondent.open = false;
            } else {
                $scope.closeRespondents();
                $scope.respondent = respondent;
                respondent.open = true;
            }
        };

        

});