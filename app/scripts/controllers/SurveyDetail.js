'use strict';

var stateAbrv = "NO_STATE";

angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, offlineSurvey) {

    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        $scope.question = _.find($scope.survey.questions, function(question) {
            return question.slug === $routeParams.questionSlug;
        });

        $scope.nextQuestionPath = ['survey', $scope.survey.slug, $scope.getNextQuestion(), $routeParams.uuidSlug].join('/');

        if ($scope.question.slug == 'state') {
            // Grab the options list.
            $http.get('/static/survey/surveys/states.json').success(function(data) {
                $scope.question.options = data;
            });        
        } else if ($scope.question.slug == 'county') {
            // Prep a list of counties specific to the state the user lives in.
            // todo: get the state from the previous answer. for now we'll use Oregon.
            if (!stateAbrv) {
                stateAbrv = "NO_STATE";
            }
            //$http.get('http://api.sba.gov/geodata/county_links_for_state_of/'+ stateAbrv +'.json').success(function(data, status, headers, config) {
            $http.get('/static/survey/surveys/counties/'+ stateAbrv +'.json').success(function(data, status, headers, config) {
                if( Object.prototype.toString.call( data ) === '[object Array]' && data.length > 0) {
                    $scope.question.options = data;
                } else {
                    $scope.question.options = [ {label:"NO_COUNTY", text:"No counties found. Please select this option and continue."} ];
                }

            }).error(function (data, status, headers, config) {
                $scope.question.options = [ {label:"NO_COUNTY", text:"No counties found. Please select this option and continue."} ];
            });
        }

    });

    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];

        return nextQuestion ? nextQuestion.slug: null;
    };

    $scope.answerQuestion = function(answer) {
        var url = ['/respond/answer',$scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/'),
            nextQuestion = $scope.getNextQuestion(), nextUrl;

        if (nextQuestion) {
            nextUrl = ['survey', $scope.survey.slug, nextQuestion, $routeParams.uuidSlug].join('/');
        } else {
            nextUrl = ['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/');
        }

        if ($scope.survey.offline) {
            offlineSurvey.answerQuestion($scope.survey, $scope.question, $scope.answer);
        } else {
            $http({
                url: url,
                method: 'POST',
                data: {"answer": answer},
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data) {
                $location.path(nextUrl);
            });
        }

        if ($scope.question.slug == 'state') {
            stateAbrv = answer;
        }

    };

});