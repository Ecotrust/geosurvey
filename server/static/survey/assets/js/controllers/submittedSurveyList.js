//'use strict';

angular.module('askApp')
    .controller('submittedSurveyListCtrl', function($scope, $http, $routeParams, $location, survey, history) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';

        $scope.respondents = _.toArray(app.respondents);
        $scope.respondentIndex = app.respondents;        
        if (app.user) {
            $scope.user = app.user;    
        } else {
            $location.path('/');
        }
        $scope.showErrorMessage = false;

        $scope.path = $location.path().slice(1,5);
        $scope.viewPath = app.viewPath;

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

        $http.get(app.server + '/reports/respondants_summary')
            .success( function (data) {
                $scope.start_time = data.start_time;
                var date = new Date(),
                    firstDayOfCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1),
                    start_date = firstDayOfCurrentMonth.toString('yyyy-MM-dd');
                    today = date.toString('yyyy-MM-dd');

                $scope.surveyFilter = {start: start_date, end: today};
                $scope.getSubmittedSurveysList($scope.surveyFilter);
            }).error(function (err) {
                console.log(JSON.stringify(err));
                // debugger;
                $scope.showSurveyList = false;
                $scope.showErrorMessage = true;
            });

        $scope.$watch('surveyFilter', function(newValue) {
            if (newValue) {
                // $scope.getSubmittedSurveysList(newValue);
                $scope.updateEnabled = true;
            }
        }, true);

        $scope.showSurveyList = false;

        $scope.updateSurveyList = function() {
            $scope.updateEnabled = false;

            $scope.getSubmittedSurveysList($scope.surveyFilter);
        };
        
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
            $location.path('/respondents');
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
                $scope.respondent = respondent;
                $scope.getRespondent(respondent);
                respondent.open = true;
            }
            // respondent.open = !respondent.open;
        };

        $scope.getRespondent = function (respondent) {
            var url = app.server 
                  + '/api/v1/reportrespondantdetails/'
                  + respondent.uuid 
                  + '/?format=json';        

            return $http.get(url)
                .success(function (data) {
                    var respondent = data;
                    if (typeof(respondent.responses.question) !== 'string') {
                        _.each(respondent.responses, function(response, index) {
                            var questionSlug = response.question.slug;
                            try {
                                answer_raw = JSON.parse(response.answer_raw);
                            } catch(e) {
                                console.log('failed to parse answer_raw');
                                answer_raw = response.answer;
                            }
                            response.question = questionSlug;
                            response.answer = answer_raw;
                        });
                    }
                    respondent.survey = respondent.survey_slug;
                    $scope.respondent = respondent;
                }).error(function (err) {
                    console.log(JSON.stringify(err));
                    debugger;
                }); 
        };

        $scope.getSubmittedSurveysListFromServer = function(surveyFilter) {
            var url = $scope.next20 ? $scope.next20 : 
                      app.server 
                      + '/api/v1/reportrespondant/?user__username__exact=' 
                      + $scope.user.username 
                      + '&format=json';
            
            if (surveyFilter.start) {
                url += '&ordering_date__gte=' + surveyFilter.start; 
            }
            if (surveyFilter.end) {
                url += '&ordering_date__lte=' + new Date(surveyFilter.end).add(1).days().toString('yyyy-MM-dd');
            }

            return $http.get(url).error(function (err) {
                console.log(JSON.stringify(err));
                debugger;
            }).success(function (callback) { $scope.next20 = callback.meta.next; $scope.updateEnabled = false;  });  
        };

        $scope.showNext20 = function(surveyFilter) {
            $scope.gettingNext20 = true;
            $scope.getSubmittedSurveysListFromServer(surveyFilter)
                .success(function (data) {
                    _.each(data.objects, function(respondent, index) {
                        try {
                            respondent.survey = respondent.survey_slug;
                            respondent.open = false;
                            $scope.respondentList.push(respondent);
                        }
                        catch(e) {
                            debugger;
                        }
                    });
                    $scope.gettingNext20 = true;
                    // console.log($scope.respondentList);
                }).error(function (data) {
                    debugger;
                }); 
        };

        $scope.getSubmittedSurveysList = function(surveyFilter) {

            $scope.showSurveyList = false;

            $scope.getSubmittedSurveysListFromServer(surveyFilter)
                .success(function (data) {
                    $scope.respondentList = [];
                    _.each(data.objects, function(respondent, index) {
                        try {
                            respondent.survey = respondent.survey_slug;
                            respondent.open = false;
                            $scope.respondentList.push(respondent);
                        }
                        catch(e) {
                            debugger;
                        }
                    });
                    $scope.showSurveyList = true;
                    // console.log($scope.respondentList);
                }).error(function (data) {
                    debugger;
                }); 

        };

        $scope.getSubmittedSurveys = function () {
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

        //$scope.getSubmittedSurveysList();

});