//'use strict';

var map = {
    center: {
        lat: 47,
        lng: -124
    },
    zoom: 7,
    marker: {
        visibility: true,
        lat: 47,
        lng: -124,
        icon: 'crosshair_white.png'

    },
    msg: null
};

function ZoomAlertCtrl($scope, dialog, $location) {
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.close = function(result) {
        dialog.close(result);
    };
}

function OutOfBoundsAlertCtrl($scope, dialog, $location) {
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.close = function(result) {
        dialog.close(result);
    };
}

function addMoreDialogCtrl($scope, dialog, remainingActivities, $location){
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.remainingActivities = remainingActivities;
    $scope.close = function(result){
        dialog.close(result);
    };
}

function DoneDialogCtrl($scope, dialog, remainingActivities, $location){
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.remainingActivities = remainingActivities;
    $scope.close = function(result){
        dialog.close(result);
    };
}

function ActivitiesCtrl($scope, dialog, $location, $timeout) {
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.onResize = function () {
        $timeout(function () {
            // Set modal body height to allow scrolling.
            var m = jQuery('.modal').height(),
                h = jQuery('.modal-header:visible').outerHeight(),
                f = jQuery('.modal-footer:visible').outerHeight(),
                b = jQuery(window).width() < 601 ? m - h - f : 'auto';
            jQuery('.modal-body').height(b);
            jQuery('.modal-body').css('margin-bottom', f+'px');
        }, 0);
    };
    $timeout(function () {
        jQuery(window).resize($scope.onResize);
        $scope.onResize();
    }, 30);
    

    $scope.close = function(result) {
        dialog.close(result);
    };
}

function ActivitySelectorDialogCtrl($scope, dialog, $location, $window, $timeout, question, activeMarker) {
    $scope.question = question;
    $scope.activeMarker = activeMarker;
    $scope.dialog = dialog;

    // This dialog has three panes.
    $scope.panes = {
        confirmPane: {},
        activitySelectionPane: {},
        deleteConfirmationPane: {},
        thankYouPane: {}
    };
    $scope.currentPane = null;
    $scope.show = function (paneName) {
        if (_.has($scope.panes, paneName)) {
            _.each($scope.panes, function (value, key, list) {
                $scope.panes[key].showing = false;
            });
            $scope.panes[paneName].showing = true;
            $scope.currentPane = $scope.panes[paneName];
        }
        $scope.onResize();
    };

    $scope.onResize = function () {
        $timeout(function () {
            // Set modal body height to allow scrolling.
            var m = jQuery('.modal').height(),
                h = jQuery('.modal-header:visible').outerHeight(),
                f = jQuery('.modal-footer:visible').outerHeight(),
                b = jQuery(window).width() < 601 ? m - h - f : 'auto';
            jQuery('.modal-body').height(b);
            jQuery('.modal-body').css('margin-bottom', f+'px');
        }, 0);
    };
    $timeout(function () {
        jQuery(window).resize($scope.onResize);
        $scope.onResize();
    }, 0);

    if ($scope.question && $scope.question.update) {
        // editing, no need to confirm location
        $scope.show('activitySelectionPane');
    } else {
        // new location, let's confirm
        $scope.show('confirmPane');
    }

    // Ensure modal doesn't stay open on change of URL.
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });
    $scope.close = function(result){
        dialog.close(result);
    };
}


angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, $dialog, $interpolate, $timeout, logger) {

    $scope.survey = {
        state: 'loading'
    };

    $scope.answers = {};

    $scope.isAuthenticated = isAuthenticated;

    // landing page view
    $scope.landingView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/landing.html';

    $scope.zoomModel = {
        zoomToResult: undefined
    };


    $scope.getAnswer = function(questionSlug) {
        if ($scope.answers[questionSlug]) {
            return $scope.answers[questionSlug];
        } else {
            return false;
        }
    };

    $scope.gotoNextQuestion = function(numQsToSkips) {
        var nextUrl = $scope.getNextQuestionPath(numQsToSkips);
        if (nextUrl) {
            $location.path(nextUrl);
        }
    };

    $scope.getNextQuestionPath = function(numQsToSkips) {
        var nextQuestion = $scope.getNextQuestion(numQsToSkips);
        return ['survey', $scope.survey.slug, nextQuestion || 'complete', $routeParams.uuidSlug].join('/');
    };

    $scope.getNextQuestion = function(numQsToSkips) {
        var index = _.indexOf($scope.survey.questions, $scope.question) + 1 + (numQsToSkips || 0);
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[index];

        return nextQuestion ? nextQuestion.slug : null;
    };

    $scope.getResumeQuestionPath = function (lastQuestion) {
        var resumeQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, _.findWhere($scope.survey.questions, {slug: lastQuestion})) + 1];
        return ['survey', $scope.survey.slug, resumeQuestion.slug, $routeParams.uuidSlug].join('/');
    };
    
    /* () */ 
    $scope.shouldSkipNextQuestion = function (currentQuestionSlug, currentAnswer, callback) {
        switch(currentQuestionSlug) 
        {
        case 'state':
            $http.get('/static/survey/surveys/counties/' + (currentAnswer || {}).label + '.json')
            .success(function(data) { 
                callback(false);
            })
            .error(function(data) {
                callback(true);
            });
            break;
        
        case 'expenses':
            callback(!(currentAnswer && currentAnswer.length > 0));
            break;
        default: 
            callback(false);
        }
    };

    $scope.terminateIf = function(answer, condition) {
        var op = condition[0],
            testCriteria = condition.slice(1),
            terminate = false;

        if (op === '<') {
            terminate = answer < testCriteria;
        } else if (op === '>') {
            terminate = answer > testCriteria;
        } else if (op === '=') {
            terminate = answer === testCriteria;
        }
        return terminate;
    };

    $scope.answerQuestion = function(answer, otherAnswer) {

        $timeout(function () {
            $scope.showSpinner = true;
        }, 300);

        var url = ['/respond/answer', $scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/');
        if ($scope.dialog) {
            if (!$scope.question.update) {
                $scope.dialog.options.save($scope.question, answer);
                $scope.dialog.$scope.close('askIfDone');
            } else {
                $scope.dialog.options.save($scope.question, answer);
                $scope.dialog.$scope.close();
            }
        } else {

            // sometimes we'll have an other field with option text box
            if (answer === 'other' && otherAnswer) {
                answer = otherAnswer;
            }
            if ($scope.question.required && (answer === undefined || answer === null)) {
                return false;
            } else if (!$scope.question.required && (answer === undefined || answer === null)) {
                answer = '';
            }


            if ($scope.locations && $scope.locations.length) {
                answer = angular.toJson(_.map($scope.locations,

                function(location) {
                    var returnValue = {
                        lat: location.lat,
                        lng: location.lng,
                        color: location.color,
                        answers: location.answers
                    };

                    if (location.pennies) {
                        returnValue.pennies = parseInt(location.pennies, 10);
                    }
                    return returnValue;
                }));
            }
            $http({
                url: url,
                method: 'POST',
                data: {
                    'answer': answer
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data.complete) {
                    $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/'));
                } else {
                    if ($scope.dialog) {
                        // we are in a dialog and need to handle it
                        $scope.dialog.close();
                        $scope.addLocation();
                    } else {
                        if ($scope.question.term_condition && $scope.terminateIf(answer, $scope.question.term_condition)) {
                            $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug, 'terminate', $routeParams.questionSlug].join('/'));
                        } else {
                            $scope.answers[$routeParams.questionSlug] = answer;
                            if (! app.data.responses) {
                                app.data.responses = [];
                            }

                            app.data.responses.push({
                                answer: answer,
                                question: $scope.question
                            });

                            $scope.shouldSkipNextQuestion($scope.question.slug, answer, function (shouldSkip) {
                                var numQsToSkips = shouldSkip ? 1 : 0;
                                $scope.gotoNextQuestion(numQsToSkips);
                            });
                        }
                    }
                }

            }).error(function(data, status, headers, config) {
                if (console) {
                    console.log(data);
                }
            });
        }
    };
    
    $scope.onMultiSelectClicked = function(option, question) {
        option.checked = !option.checked;
        if (! option.checked && option.other) {
            $scope.question.otherAnswer = null;
        }
        $scope.isAnswerValid = $scope.validateMultiSelect(question);
    };

    $scope.validateMultiSelect = function(question) {
        var hoistedAnswers,
        answers,
        isOtherAnswerValid = true;

        if (!question.required) {
            return true;
        }

        answers = _.filter(question.options, function(option) {
            return option.checked;
        });

        if (question.hoisted_options) {
            hoistedAnswers = _.filter(question.hoisted_options, function(option) {
                return option.checked;
            });
            answers = answers.concat(hoistedAnswers);
        }

        if (question.allow_other && question.otherOption && question.otherOption.checked) {
            if (question.otherAnswer === null || question.otherAnswer.length < 1) {
                // other answer is blank, report back as invalid
                isOtherAnswerValid = false;
            } else {
                answers.push(question.otherAnswer);
            }
        }

        // enable/disable continue button
        return answers.length > 0 && isOtherAnswerValid;
    };

    /**
     * Filters out unselected items and submits an array of the selected options.
     * @param  {array} options An array of all options regardless of which options the
     * user selected.
     */
    $scope.answerMultiSelect = function(question) {
        var answers;

        if (!$scope.isAnswerValid) {
            return;
        }

        if (question.hoisted_options) {
            question.options = question.options.concat(question.hoisted_options);
        }
        answers = _.filter(question.options, function(option) {
            return option.checked;
        });

        if (question.otherAnswer) {
            answers.push({
                text: question.otherAnswer,
                label: question.otherAnswer,
                checked: true,
                other: true
            });
        }

        $scope.answerQuestion(answers);
    };

    $scope.onSingleSelectClicked = function(option, question) {

        // turn off all other options
        _.each(_.without(question.options, option), function(option) {
            option.checked = false;
        });

        if (question.otherOption && option === question.otherOption) {
            question.otherOption.checked = !question.otherOption.checked;
        } else {

            option.checked = !option.checked;
            if (question.otherOption) {
                question.otherOption.checked = false;
            }
        }

        // enable continue
        if (!question.required || (option.checked && option !== question.otherOption)) {
            $scope.isAnswerValid = true;
        } else {
            $scope.isAnswerValid = false;
        }

    };

    $scope.$watch('question.otherAnswer', function(newValue) {

        if ($scope.question && $scope.question.required && ! $scope.answer) {
            if ($scope.question.allow_other && $scope.question.otherOption && $scope.question.otherOption.checked && $scope.question.otherAnswer && $scope.question.otherAnswer.length > 0) {
                $scope.isAnswerValid = true;
            } else {
                $scope.isAnswerValid = false;
            }
        } else {
            $scope.isAnswerValid = true;
        }
    });


    $scope.answerSingleSelect = function(options, otherAnswer) {
        var answer = _.find(options, function(option) {
            return option.checked;
        });

        if (answer) {
            $scope.answerQuestion(answer);
        } else if (otherAnswer) {
            answer = {
                checked: true,
                label: otherAnswer,
                text: otherAnswer,
                other: true
            };
            $scope.answerQuestion(answer);
        } else if (!$scope.question.required) {
            // No answer given. Submit empty.
            $scope.answerQuestion({ text: 'NO_ANSWER' });
        }

    };

    $scope.answerAutoSingleSelect = function(answer, otherAnswer) {
        if (answer === 'other') {
            $scope.answerQuestion({
                text: otherAnswer,
                label: answer
            });
        } else {
            $scope.answerQuestion($scope.question.options[answer]);
        }
    };

    $scope.answerMapQuestion = function (locations) {
        $scope.answerQuestion(locations);
    };

    $scope.loadSurvey = function (data) {
        $scope.survey = data.survey;
        $scope.survey.status = data.status;

        _.each(data.responses, function(response) {
            try {
                $scope.answers[response.question.slug] = JSON.parse(response.answer_raw);
            } catch (e) {
                $scope.answers[response.question.slug] = response.answer;
            }
        });

        if (data.last_question) {
            $scope.resumeQuestionPath = $scope.getResumeQuestionPath(data.last_question);
        } else {
            $scope.resumeQuestionPath = 'NO_RESUME';
        }
        // we may inject a question into the scope
        if (!$scope.question) {
            $scope.question = _.find($scope.survey.questions, function(question) {
                return question.slug === $routeParams.questionSlug;
            });

        }


        if ($scope.question && $scope.question.title) {
            $scope.question.displayTitle = $interpolate($scope.question.title)($scope);
        }

        if ($scope.question && $scope.question.type === 'info' && $scope.question.info) {
            $scope.infoView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/' + $scope.question.info + '.html';

        }

        $scope.nextQuestionPath = $scope.getNextQuestionPath();

        /* Specific to single and multi select for now. */
        $scope.isAnswerValid = $scope.question && !$scope.question.required;

        if ($scope.question && $scope.question.type === 'integer') {
            $scope.answer = parseInt($scope.getAnswer($routeParams.questionSlug), 10);
        } else if ($scope.question && $scope.question.options.length) {
            $scope.answer = $scope.getAnswer($routeParams.questionSlug);
            // check to make sure answer is in options
            if ($scope.answer && ! _.isArray($scope.answer)) {
                $scope.answer = [$scope.answer];
            }
            if ($scope.answer) {

                _.each($scope.answer, function (answer) {
                    if (! answer.other) {

                        _.each($scope.question.options, function(option) {
                            if ( (answer.text || answer.name) === (option.text || option.name) ) {
                                option.checked = true;
                                $scope.isAnswerValid = true;
                            } else {
                                option.checked = false;
                            }
                        });
                    } else {
                        // otherwise assume it is other
                        $scope.question.otherOption = {
                            checked: true,
                            'other': true
                        };
                        $scope.question.otherAnswer = answer;
                    }
                });
            }
        } else {
            $scope.answer = $scope.getAnswer($routeParams.questionSlug);
            if (! $scope.answer) {
                $scope.answer = null;
            }
        }


        // Fill options list.
        if ($scope.question && $scope.question.options_json && $scope.question.options_json.length > 0 && !$scope.question.options_from_previous_answer) {
            // Using the provided json file to set options.
            $http.get($scope.question.options_json).success(function(data) {
                var groups = _.groupBy(data, function(item) {
                    return item.group;
                }),
                    previousAnswers = [];
                
                if ($scope.question.update && $scope.activeMarker) {
                    previousAnswers = _.pluck($scope.activeMarker.answers, 'text');    
                } else if ($scope.answer) {
                    if (_.isArray($scope.answer)) {
                        previousAnswers = _.pluck($scope.answer, 'text');        
                    } else {
                        previousAnswers = [$scope.answer.text];
                    }
                    
                }
                
                if ($scope.question.randomize_groups) {
                    $scope.question.options = _.flatten(_.shuffle(_.toArray(groups)));
                } else {
                    $scope.question.options = data;
                }


                // Set answers for editing a marker.
                if ($scope.activeMarker && $scope.activeMarker.answers) {
                    _.each($scope.question.options, function(option, index, list) {
                        var result = _.find($scope.activeMarker.answers, function(answer) {
                            return option.label === answer.label;
                        });
                        option.checked = !_.isUndefined(result);            
                    });
                }
                
                // Hoist options.
                if ($scope.question && $scope.question.hoist_answers) {
                    $scope.question.hoisted_options = [];

                    _.each($scope.getAnswer($scope.question.hoist_answers.slug), function(option) {
                        var newOption = {};

                        angular.extend(newOption, option);
                        
                        if (_.contains(previousAnswers, option.text)) {
                            newOption.checked = true;
                        } else {
                            newOption.checked = false;
                        }
                    
                        

                        $scope.question.hoisted_options.unshift(newOption);
                        $scope.question.options = _.filter($scope.question.options, function(item) {
                            return item.label !== option.label;
                        });
                    });
                }

                _.each($scope.question.options, function (option) {
                    
                    if (_.contains(previousAnswers, option.text)) {
                        option.checked = true;
                    } else {
                        option.checked = false;
                    }


                });


                if ($scope.question.type === "multi-select") {
                    $scope.isAnswerValid = $scope.validateMultiSelect($scope.question);
                }
            });

        } else if ($scope.question && $scope.question.options_from_previous_answer && $scope.question.slug === 'county') {
            // County question is dependent on state answer to retrieve a
            // json file of counties for the selected state.

            var stateAbrv = 'NO_STATE',
                stateAnswer = $scope.getAnswer($scope.question.options_from_previous_answer);
            if (stateAnswer.label && stateAnswer.label.length > 2) {
                // submitted via other text box
                stateAbrv = stateAnswer.label.toLowerCase().replace(/\s+/g, '');
            } else if (stateAnswer.label) {
                stateAbrv = stateAnswer.label;
            }

            $http.get('/static/survey/surveys/counties/' + stateAbrv + '.json').success(function(data, status, headers, config) {
                $scope.question.options = data;
                if (!$scope.answer) { 
                    return;
                }
                if (_.isArray($scope.answer)) {
                    $scope.answer = _.first($scope.answer);
                }
                _.each($scope.question.options, function (option, index) {
                    if (option.name === $scope.answer.name) {
                        option.checked = true;
                        $scope.isAnswerValid = true;
                    }
                });    
                
            }).error(function(data, status, headers, config) {
                $scope.gotoNextQuestion();
            });
        }

        if ($scope.question) {
            if ($scope.answer &&  $scope.question.allow_other && $scope.answer.other || _.isArray($scope.answer) && _.findWhere($scope.answer, { other: true })) {
                $scope.question.otherOption = {
                    'checked': true,
                    'other': true
                };
                $scope.question.otherAnswer = $scope.answer.text || _.findWhere($scope.answer, { other: true }).text;
            } else {
                $scope.question.otherOption = {
                    'checked': false,
                    'other': true
                };
                $scope.question.otherAnswer = null;
            }    
        }
        

        if ($scope.question && $scope.question.options_from_previous_answer) {
            $scope.question.options = $scope.getAnswer($scope.question.options_from_previous_answer);

            _.each($scope.question.options, function(item) {
                item.checked = false;
            });
            if ($scope.answer) {
                var answerArr = _.isArray($scope.answer) ? $scope.answer : [$scope.answer];
                _.each($scope.question.options, function(item) {
                    _.each(answerArr, function (answer) {
                        if ((item.text || item.name) === (answer.text || answer.name)) {
                            item.checked = true;
                            $scope.isAnswerValid = true;
                        }
                    });
                });
            }
        }

        if ($scope.question) {
            $scope.map = map;
            $scope.map.center.lat = $scope.question.lat || map.center.lat;
            $scope.map.center.lng = $scope.question.lng || map.center.lng;
            $scope.map.zoom = $scope.question.zoom || map.zoom;
        }

        // penny question controller
        if ($scope.question && ($scope.question.type === 'pennies' || $scope.question.slug === 'pennies-intro')) {
            if ($scope.question.options_from_previous_answer) {
                $scope.primaryActivity = $scope.getAnswer($scope.question.options_from_previous_answer.split(',')[1]);
                $scope.locations = _.filter(JSON.parse($scope.getAnswer($scope.question.options_from_previous_answer.split(',')[0])), function(location) {
                    return _.some(location.answers, function(item) {
                        return item.label === $scope.primaryActivity.label;
                    });
                });
            }

            $scope.question.total = 100;

            _.each($scope.locations, function(location) {
                location.pennies = null;
                $scope.$watch(function() {
                    return location.pennies;
                },

                function(newValue) {
                    var timer;
                    if (newValue) {
                        if (timer) {
                            timer.cancel();
                        } else {
                            timer = $timeout(function() {
                                var total = _.pluck($scope.locations, 'pennies');
                                var sum = _.reduce(total, function(memo, num) {
                                    return parseInt(memo, 10) + parseInt(num ? num : 0, 10);
                                }, 0);
                                $scope.question.total = 100 - sum;
                            }, 300);
                        }

                    }

                });
            });
        }

        // map 
        if ($scope.question && $scope.question.type === 'map-multipoint') {
            $scope.activeMarker = false;

            if (! $scope.answer) {
                $scope.locations = [];
            } else {
                $scope.locations = JSON.parse($scope.answer);
            }

            // $scope.layers = [];
            // $scope.layers[0] = {label: 'Satellite Imagery', mapId: 'bing'};
            // $scope.layers[1] = {label: 'Nautical Charts', mapId: 'nautical'};
            // $scope.toggleLayer = function () {
            //     if ()
            //     $scope.map.addLayer(, true).removeLayer();
            // };

            $scope.updateCrosshair = function() {
                if ($scope.activeMarker !== false) {
                    $scope.map.marker.icon = "crosshair_blank.png";

                } else if ($scope.isCrosshairAlerting && !$scope.isZoomedIn()) {
                    $scope.map.marker.icon = "crosshair_red.png";

                } else if ($scope.isCrosshairAlerting && $scope.isZoomedIn()) {
                    $scope.map.marker.icon = "crosshair_green.png";

                } else {
                    $scope.map.marker.icon = "crosshair_white.png";
                }
            };


            $http.get("/static/survey/data/marco_dd.json?v=2").success(function(data) {
                $scope.boundaryLayer = L.geoJson(data);
            });

            $scope.isOutOfBounds = function () {
                var point, results;
                if ($scope.boundaryLayer) {
                    point = new L.LatLng($scope.map.marker.lat, $scope.map.marker.lng);
                    results = leafletPip.pointInLayer(point, $scope.boundaryLayer, true);
                    // results is an array of L.Polygon objects containing that point
                    return results.length < 1;
                }
                return true; // not using a boundary layer
            };

            $scope.addMarker = function () {
                if ($scope.activeMarker) {
                    scope.activeMarker.marker.closePopup();
                }
                if (!$scope.isZoomedIn()) {
                    $scope.isCrosshairAlerting = true;
                    $scope.showZoomAlert();
                } else if ($scope.isOutOfBounds()) {
                    console.log('not in boundary');
                    $scope.showOutOfBoundsAlert();
                } else {
                    // Add location
                    $scope.activeMarker = {
                        lat: $scope.map.marker.lat,
                        lng: $scope.map.marker.lng,
                        color: $scope.getNextColor()
                    };
                    $scope.locations.push($scope.activeMarker);
                    $timeout(function () {
                        $scope.showAddLocationDialog();
                    }, 400);
                    $scope.isCrosshairAlerting = false;
                }
                $scope.updateCrosshair();
            };

            $scope.addLocation = function(location) {
                // var locations = _.without($scope.locations, $scope.activeMarker);
                location.color = $scope.activeMarker.color;
                $scope.locations[_.indexOf($scope.locations, $scope.activeMarker)] = location;
                // $scope.locations = locations;
                // $scope.locations.push(location);
                $scope.activeMarker = false;
                $scope.updateCrosshair();
                logger.logUsage('locationAdded', '{numLocations: ' + $scope.locations.length + '}');
            };

            $scope.cancelConfirmation = function() {
                if ($scope.dialog) {
                    $scope.dialog.options.cancel();
                } else {
                    $scope.removeLocation($scope.activeMarker);
                    $scope.activeMarker = false;
                }
            }

            $scope.editMarker = function(location) {
                if (!location.question) {
                    location.question = {};
                    angular.extend(location.question, $scope.question.modalQuestion);
                }
                location.question.update = true;    
                $scope.activeMarker = location;
                $scope.showAddLocationDialog(location.question);
            };

            $scope.removeLocation = function(location) {
                // This is used for both canceling a new location and deleting an 
                // existing location when in edit mode.
                var locations = _.without($scope.locations, location);
                $scope.locations = locations;
            };

            $scope.showLocation = function(location) {
                $scope.zoomModel.zoomToResult = location;
            };



            $scope.showAddLocationDialog = function(question) {
                if (_.isUndefined(question)) {
                    question = $scope.question.modalQuestion;
                }
                
                $scope.dialog = $dialog.dialog({
                    backdrop: true,
                    keyboard: false,
                    backdropClick: false,
                    templateUrl: '/static/survey/views/locationActivitiesModal.html',
                    controller: 'ActivitySelectorDialogCtrl',
                    resolve: {
                        question: function () { return question; },
                        activeMarker: function () { return $scope.activeMarker; }
                    },
                    save: function (question, answer) {
                        if (question.update) {
                            $scope.locations[_.indexOf($scope.locations, $scope.activeMarker)].answers = answer;
                        } else {
                            $scope.addLocation({
                                lat: $scope.activeMarker.lat,
                                lng: $scope.activeMarker.lng,
                                color: $scope.activeMarker.color,
                                question: question,
                                answers: answer
                            });
                        }
                        $scope.activeMarker = false;
                        question.update = false;
                    }
                });

                $scope.dialog.open().then(function (result) {
                    $scope.dialog = null;
                    if (result == 'cancel') {
                        $scope.removeLocation($scope.activeMarker);
                        $scope.activeMarker = false;
                        if (question) {
                            question.update = false;
                        }
                        $scope.updateCrosshair();

                    } else if (result === 'askIfDone') {
                        $scope.showAddMoreDialog();
                    }
                });
                logger.logUsage('add-location-modal-shown', '');
            };

            $scope.showZoomAlert = function () {
                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: false,
                    backdropClick: false,
                    backdropFade: true,
                    transitionClass: 'fade',
                    templateUrl: '/static/survey/views/zoomAlertModal.html',
                    controller: 'ZoomAlertCtrl'
                });
                d.open();
                logger.logUsage('zoom-alert-shown', '');
            };

            $scope.showOutOfBoundsAlert = function () {
                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: false,
                    backdropClick: false,
                    backdropFade: true,
                    transitionClass: 'fade',
                    templateUrl: '/static/survey/views/outOfBoundsAlertModal.html',
                    controller: 'OutOfBoundsAlertCtrl'
                });
                d.open();
                logger.logUsage('out-of-bounds-alert-shown', '');
            };

            $scope.showActivities = function() {
                $dialog.dialog({
                    backdrop: true,
                    keyboard: true,
                    backdropClick: false,
                    templateUrl: '/static/survey/views/activitiesModal.html',
                    scope: {
                        hoisted_options: $scope.getAnswer($scope.question.modalQuestion.hoist_answers.slug),
                        locations: $scope.locations,
                        editLocation: $scope.editMarker,
                        removeLocation: $scope.removeLocation,
                        showLocation: $scope.showLocation,
                        remainingActivities: $scope.getRemainingActivities()
                    },
                    controller: 'ActivitiesCtrl'
                }).open();
            };

            $scope.showAddMoreDialog = function () {
                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: false,
                    backdropClick: false,
                    templateUrl: '/static/survey/views/addMoreModal.html',
                    controller: 'addMoreDialogCtrl',
                    resolve: { remainingActivities: function () {
                            return $scope.getRemainingActivities();
                        }
                    }
                });
                
                d.open().then(function (result) {
                    if (result === 'doneMapping') {
                        $scope.answerMapQuestion($scope.locations);
                    
                    } else if (result === 'addMoreLocations') {
                        $scope.showMyActivitesPopover();
                        $timeout(function () {
                            // trigger the search modal to be open
                            jQuery("div[zoomto] input").click();
                        }, 300);
                    }
                });
            };

            $scope.showDoneDialog = function () {
                var d = $dialog.dialog({
                    backdrop: true,
                    keyboard: false,
                    backdropClick: false,
                    templateUrl: '/static/survey/views/doneModal.html',
                    controller: 'DoneDialogCtrl',
                    resolve: { remainingActivities: function () {
                            return $scope.getRemainingActivities();
                        }
                    }
                });
                
                d.open().then(function (result) {
                    if (result == 'yes') {
                        $scope.answerMapQuestion($scope.locations);
                    }
                });
            };

            $scope.myActivitiesPopoverShown = false;
            $scope.showMyActivitesPopover = function() {
                // Only showing this popover once
                if (!$scope.myActivitiesPopoverShown) {
                    $timeout(function() {
                        jQuery('.btn-my-activities').popover({
                            trigger: 'manual',
                            placement: 'bottom'
                        });
                        jQuery('.btn-my-activities').popover('show');
                        $scope.myActivitiesPopoverShown = true;
                    }, 500);
                }
            };

            /**
             * @return {array} Returns activities that the user had selected but has not
             * yet mapped.
             */
            $scope.getRemainingActivities = function () {
                var selectedActivities = $scope.getAnswer($scope.question.modalQuestion.hoist_answers.slug);
                // Filter out activities that have already been mapped.
                var remainingActivities = _.difference(
                    _.pluck(selectedActivities, 'text'),
                    _.flatten(_.map($scope.locations, function (location) {
                        return _.pluck(location.answers, 'text');
                    })));

                return angular.copy(remainingActivities);
            };

            /**
             * @return {string} Returns the color to be applied to the next marker.
             */
            $scope.getNextColor = function () {
                var availableColors = [],
                    colorPalette = [
                    'red',
                    'orange',
                    'green',
                    'darkgreen',
                    'darkred',
                    'blue',
                    'darkblue',
                    'purple',
                    'darkpurple',
                    'cadetblue'
                ];

                availableColors = angular.copy(colorPalette);
                _.each($scope.locations, function (marker) {
                    if (_.has(marker, 'color')) {
                        availableColors = _.without(availableColors, marker.color);
                    }
                    if (availableColors.length == 0) {
                        // Recyle the colors if we run out.
                        availableColors = angular.copy(colorPalette);
                    }                        
                });
                return _.first(availableColors);
            };

            $scope.isCrosshairAlerting = false;

            $scope.isZoomedIn = function () {
                return $scope.map.zoom >= $scope.question.min_zoom;
            };            

        }

        // grid question controller
        if ($scope.question && $scope.question.type === 'grid') {
            // Prep initial row data.
            $scope.question.options = $scope.getAnswer($scope.question.options_from_previous_answer);

            if ($scope.question.options.length < 1) {
                // Skip this question since we have no items to list.
                $scope.gotoNextQuestion();
            }

            if ($scope.answer) {
                $scope.answer = _.groupBy($scope.answer, 'text');
            } else {
                $scope.answer = {};
            }
            
            _.each($scope.question.options, function(value, key, list) {
                list[key] = {
                    label: value.label,
                    text: value.text,
                    cost: $scope.answer !== null && _.has($scope.answer, value.text) ? $scope.answer[value.text][0].cost: undefined,
                    numPeople: $scope.answer !== null && _.has($scope.answer, value.text) ? $scope.answer[value.text][0].numPeople: undefined
                };
            });

            // Configure grid.
            var gridCellTemplateDefault = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>';
            var costCellTemplate = '<input class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]" style="height: 100%;" type="number" min="0" max="10000" value="{{row.getProperty(col.field)}}" ui-event="{ keypress : \'onlyDigits($event)\' }" required/>';
            var numPeopleCellTemplate = '<input class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]" style="height: 100%;" type="number" min="0" max="1000" value="{{row.getProperty(col.field)}}" ui-event="{ keypress : \'onlyDigits($event)\' }" required/>';
            $scope.gridOptions = {
                data: 'question.options',
                enableSorting: false,
                enableCellSelection: true,
                canSelectRows: false,
                multiSelect: false,
                rowHeight: 70,
                headerRowHeight: 45,
                plugins: [new ngGridFlexibleHeightPlugin()],
                rowTemplate: '<div ng-style="{\'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell></div>',
                columnDefs: [{
                    field: 'text',
                    displayName: 'Expense Item'
                }, {
                    field: 'cost',
                    displayName: 'Cost',
                    cellTemplate: costCellTemplate,
                    minWidth: 30
                }, {
                    field: 'numPeople',
                    displayName: '# of People Covered',
                    cellTemplate: numPeopleCellTemplate,
                    minWidth: 70
                }]
            };
        }
    };

    if (! app.data) {
        $http.get('/api/v1/respondant/' + $routeParams.uuidSlug + '/?format=json').success(function(data) {
            app.data = data;
            $scope.loadSurvey(data);
        }).error(function(data, status, headers, config) {
            $scope.survey.status = 'invalid';
        });    
    } else {
        $timeout(function () {
            window.scrollTo(0, 0);    
        }, 0);
        $scope.loadSurvey(app.data);
    }
});
