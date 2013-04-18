'use strict';



var stateAbrv = "NO_STATE";


angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, $dialog, offlineSurvey) {

    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;


        // we may inject a question into the scope
        if (! $scope.question) {
            $scope.question = _.find($scope.survey.questions, function(question) {
                return question.slug === $routeParams.questionSlug;
            });    
        }
        

        $scope.nextQuestionPath = $scope.getNextQuestionPath();

        if ($scope.question && $scope.question.slug == 'state') {
            // Grab options list.
            $http.get('/static/survey/surveys/states.json').success(function(data) {
                $scope.question.options = data;
            });        
        } else if ($scope.question && $scope.question.slug == 'county') {
            // Grab options list. Dependent on state answer.
            // todo: get the state answer from the server rather than client.
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

        if ($scope.question && $scope.question.type === 'map-multipoint') {
            $scope.map = {
                center: {
                    lat: 42.505,
                    lng: -122.59
                },
                zoom: 6,
                marker: {
                    visibility: true,
                    lat: 42.505,
                    lng: -122.59,

                },
                msg: null
            }
            $scope.locations = [];
            $scope.activeMarker = false;
        }

    });


    $scope.addLocation = function (location) {
        var locations = _.without($scope.locations, $scope.activeMarker);
        $scope.locations = locations;
        $scope.locations.push(location);
        $scope.activeMarker = false;
    };

    $scope.confirmLocation = function() {
        $scope.dialog = $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: false,
            templateUrl: '/static/survey/views/questionModal.html', // OR: templateUrl: 'path/to/view.html',
            controller: 'SurveyDetailCtrl',
            scope: {
                question: $scope.question.modalQuestion
            },
            success: function (question, answer) {
                $scope.addLocation({
                    lat: $scope.map.marker.lat,
                    lng: $scope.map.marker.lng,
                    question: question,
                    answer: answer
                });
                $scope.dialog.close();
                $scope.dialog = null;
            },
            error: function (arg1, arg2) {
                debugger;
            }
        });
        $scope.dialog.options.scope.dialog = $scope.dialog;
        $scope.dialog.open();
    }


    $scope.cancelConfirmation = function() {
        var locations = _.without($scope.locations, $scope.activeMarker);
        $scope.locations = locations;
        $scope.activeMarker = false;
    }

    $scope.addMarker = function() {
        $scope.map.marker.visibility = true;
        $scope.activeMarker = {
            lat: $scope.map.marker.lat,
            lng: $scope.map.marker.lng
        };
        $scope.locations.push($scope.activeMarker);
    }

    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];


        return nextQuestion ? nextQuestion.slug : null;
    };

    $scope.getNextQuestionPath = function () {
        var nextQuestion = $scope.getNextQuestion(),
            nextUrl;

        if (nextQuestion) {
            nextUrl = ['survey', $scope.survey.slug, nextQuestion, $routeParams.uuidSlug].join('/');
        } else {
            nextUrl = ['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/');
        }

        return nextUrl;
    };

    $scope.gotoNextQuestion = function () {
        var nextUrl = $scope.getNextQuestionPath();
        if (nextUrl) {
            $location.path(nextUrl);
        }
    };

    $scope.answerQuestion = function(answer) {
        var url = ['/respond/answer', $scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/');

        if ($scope.dialog) {
            $scope.dialog.options.success($scope.question, answer);
        } else {

            if ($scope.locations.length) {
                answer = angular.toJson($scope.locations);
            }
            $http({
                url: url,
                method: 'POST',
                data: {
                    "answer": answer
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                $scope.gotoNextQuestion();
            });
        }

        if ($scope.question.slug == 'state') {
            stateAbrv = answer;
        }

    };

});