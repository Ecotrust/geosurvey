//'use strict';

angular.module('askApp')
    .controller('RespondantListCtrl', function($scope, $http, $routeParams, history) {

    $scope.busy = true;
    $scope.viewPath = app.server + '/static/survey/'; // because app.viewPath was empty string...
    console.log('BUSY');

    $http.get('/api/v1/surveyreport/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        data.questions.reverse();
        $scope.survey = data;

        _.each($scope.survey.questions, function (question) {
            // save a reference to filter questions which are specified by uri
            question.filters = {};
            if (question.visualize && question.filter_questions) {
                question.filterQuestions = [];
                _.each(question.filter_questions, function (filterQuestion) {
                    question.filterQuestions.push($scope.getQuestionByUri(filterQuestion));
                });

            }
        });
        

    }).success(function() {
        $http.get('/api/v1/dashrespondant/?format=json&survey__slug__exact=' + $routeParams.surveySlug).success(function(data) {
            $scope.respondents = data.objects;
            $scope.meta = data.meta;
            $scope.responsesShown = $scope.respondents.length;
            $scope.busy = false;
            console.log('NOT BUSY');
        });
         
    });

    $scope.getQuestionByUri = function (uri) {
        return _.findWhere($scope.survey.questions, {'resource_uri': uri});
    };

    $scope.getQuestionBySlug = function (slug) {
		return _.findWhere($scope.survey.questions, {'slug': slug});
    };

    $scope.showNext20 = function(surveyFilter) {
        $scope.gettingNext20 = true;
        $http.get($scope.meta.next)
            .success(function (data, callback) {
                _.each(data.objects, function(respondent, index) {
                    $scope.respondents.push(respondent);
                });
                $scope.responsesShown = $scope.respondents.length;
                $scope.gettingNext20 = false;
                $scope.meta = data.meta;
                // console.log($scope.respondentList);
            }).error(function (data) {
                console.log(data);
            }); 
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

    $scope.closeRespondents = function () {
        _.each($scope.respondents, function(respondent, index) {
            respondent.open = false;
        });
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



    var getSurveyTitle = function(respondent) {
        var title = respondent.survey;
        title += respondent.ts;
        return title;
    }

});
