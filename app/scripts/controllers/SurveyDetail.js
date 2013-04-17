'use strict';


function TestDialogController($scope, dialog){
  $scope.close = function(result){
    dialog.close(result);
  };
}

var stateAbrv = "NO_STATE";


angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, $dialog, offlineSurvey) {

    $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
        $scope.survey = data;

        $scope.question = _.find($scope.survey.questions, function(question) {
            return question.slug === $routeParams.questionSlug;
        });

        $scope.nextQuestionPath = ['survey', $scope.survey.slug, $scope.getNextQuestion(), $routeParams.uuidSlug].join('/');

        if ($scope.question.slug == 'state') {
            // Grab options list.
            $http.get('/static/survey/surveys/states.json').success(function(data) {
                $scope.question.options = data;
            });        
        } else if ($scope.question.slug == 'county') {
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

        if ($scope.question.type === 'map-multipoint') {
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

    $scope.confirmLocation = function() {
        $scope.locations.push($scope.activeMarker);
        $scope.activeMarker = false;
        var t = '<div class="modal-header">' +
            '<h1>This is the title</h1>' +
            '</div>' +
            '<div class="modal-body">' +
            '<p>Enter a value to pass to <code>close</code> as the result: <input ng-model="result" /></p>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button ng-click="close(result)" class="btn btn-primary" >Close</button>' +
            '</div>';



        var d = $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: false,
            template: t, // OR: templateUrl: 'path/to/view.html',
            controller: 'TestDialogController'
        });
        d.open().then(function(result) {
            if (result) {
                alert('dialog closed with result: ' + result);
            }
        });
    }

    $scope.cancelConfirmation = function() {
        $scope.activeMarker = false;
    }

    $scope.addMarker = function() {
        $scope.map.marker.visibility = true;
        $scope.activeMarker = {
            lat: $scope.map.marker.lat,
            lng: $scope.map.marker.lng
        };
    }

    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];

        return nextQuestion ? nextQuestion.slug : null;
    };

    $scope.answerQuestion = function(answer) {
        var url = ['/respond/answer', $scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/'),
            nextQuestion = $scope.getNextQuestion(),
            nextUrl;

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
                data: {
                    "answer": answer
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                $location.path(nextUrl);
            });
        }

        if ($scope.question.slug == 'state') {
            stateAbrv = answer;
        }

    };

});