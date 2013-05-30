'use strict';

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


function ActivitiesCtrl($scope, dialog) {
    $scope.close = function(result) {
        dialog.close(result);
    };
}

function MapContinueDialogCtrl($scope, dialog, remainingActivities){
    $scope.remainingActivities = remainingActivities;
    $scope.close = function(result){
        dialog.close(result);
    };
}

angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, $dialog, $interpolate, $timeout, offlineSurvey) {

    $scope.answers = {};

    $http.get('/api/v1/respondant/' + $routeParams.uuidSlug + '/?format=json').success(function(data) {
        $scope.survey = data.survey;
        _.each(data.responses, function(response) {
            try {
                $scope.answers[response.question.slug] = JSON.parse(response.answer_raw);
            } catch (e) {
                $scope.answers[response.question.slug] = response.answer;
            }
        });

        console.log($scope.answers);
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

        if ($scope.question.type === 'integer') {
            $scope.answer = parseInt($scope.getAnswer($routeParams.questionSlug), 10);
        } else if ($scope.question.options.length) {
            $scope.answer = $scope.getAnswer($routeParams.questionSlug);
            // check to make sure answer is in options
            if ($scope.answer && ! _.isArray($scope.answer)) {
                $scope.answer = [$scope.answer];
            }
            if ($scope.answer) {

                _.each($scope.answer, function (answer) {
                    if (! answer.other) {

                        _.each($scope.question.options, function(option) {
                            if (answer.text === option.text || answer.text === option.name ) {
                                option.checked = true;
                                $scope.isAnswerValid = true;
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

            var stateAnswer = $scope.getAnswer($scope.question.options_from_previous_answer),
                stateAbrv = stateAnswer.label || 'NO_STATE';
            $http.get('/static/survey/surveys/counties/' + stateAbrv + '.json').success(function(data, status, headers, config) {
                if (Object.prototype.toString.call(data) === '[object Array]' && data.length > 0) {
                    $scope.question.options = data;
                } else {
                    $scope.question.options = [{
                        label: "NO_COUNTY",
                        text: 'No counties found. Please select this option and continue.'
                    }];
                }
                _.each($scope.question.options, function (option, index) {
                    if (option.name === $scope.answer.name) {
                        option.checked = true;
                        $scope.isAnswerValid = true;
                    }
                });
            }).error(function(data, status, headers, config) {
                $scope.question.options = [{
                    label: 'NO_COUNTY',
                    text: 'No counties found. Please select this option and continue.'
                }];
            });
        }

        if ($scope.answer &&  $scope.question.allow_other && $scope.answer.other || _.findWhere($scope.answer, { other: true })) {
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

        if ($scope.question && $scope.question.options_from_previous_answer) {
            $scope.question.options = $scope.getAnswer($scope.question.options_from_previous_answer);

            _.each($scope.question.options, function(item) {
                if ($scope.answer) {
                    if (_.isArray($scope.answer)) {
                        
                    } else {
                        if (item.text === $scope.answer.text) {
                            item.checked = true;
                            $scope.isAnswerValid = true;
                        } else {
                            item.checked = false;
                        }
                    }
                } else {
                    item.checked = false;
                }
            });

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
                        showLocation: $scope.showLocation
                    },
                    controller: 'ActivitiesCtrl'
                }).open();
            };

        }

        // grid question controller
        if ($scope.question && $scope.question.type === 'grid') {
            // Prep row initial row data, each row containing values.
            // for activityLabel, activityText, cost and numPeople.
            $scope.question.options = $scope.getAnswer($scope.question.options_from_previous_answer);
            if ($scope.answer) {
                $scope.answer = _.groupBy($scope.answer, 'activityText')
            }
            
            _.each($scope.question.options, function(value, key, list) {
                list[key] = {
                    activitySlug: value.label,
                    activityText: value.text,
                    cost: $scope.answer[value.text] ? $scope.answer[value.text][0].cost: undefined,
                    numPeople: $scope.answer[value.text] ? $scope.answer[value.text][0].numPeople: undefined
                };
            });

            // todo: Fill columns with persisted data if available.

            // Hard coding values for now.
            // $scope.question.options = [
            //     {activitySlug: 'camping', activityText: 'Camping', cost: undefined, numPeople: undefined},
            //     {activitySlug: 'eating', activityText: 'Eating', cost: undefined, numPeople: undefined},
            //     {activitySlug: 'surfing', activityText: 'Surfing', cost: undefined, numPeople: undefined}
            // ];

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
                rowHeight: 50,
                plugins: [new ngGridFlexibleHeightPlugin()],
                rowTemplate: '<div ng-style="{\'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell></div>',
                columnDefs: [{
                    field: 'activityText',
                    displayName: 'Expense Item'
                }, {
                    field: 'cost',
                    displayName: 'Cost',
                    cellTemplate: costCellTemplate
                }, {
                    field: 'numPeople',
                    displayName: '# of People Covered',
                    cellTemplate: numPeopleCellTemplate
                }]
            };
        }
    });

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

    $scope.addMarker = function(color) {
        $scope.activeMarker = {
            lat: $scope.map.marker.lat,
            lng: $scope.map.marker.lng,
            color: color
        };

        $scope.locations.push($scope.activeMarker);
    }

    $scope.addLocation = function(location) {
        // var locations = _.without($scope.locations, $scope.activeMarker);
        location.color = $scope.activeMarker.color;
        $scope.locations[_.indexOf($scope.locations, $scope.activeMarker)] = location;
        // $scope.locations = locations;
        // $scope.locations.push(location);
        $scope.activeMarker = false;

        $scope.showMyActivitesPopover();
    };

    $scope.myActivitiesPopoverShown = false;
    $scope.showMyActivitesPopover = function() {
        // Only showing this popover once
        if (!$scope.myActivitiesPopoverShown) {
            setTimeout(function() {
                jQuery('.btn-my-activities').popover({
                    trigger: 'manual',
                    placement: 'bottom'
                });
                jQuery('.btn-my-activities').popover('show');
                $scope.myActivitiesPopoverShown = true;
            }, 500);
        }
    }

    $scope.confirmLocation = function(question) {
        $scope.dialog = $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: false,
            templateUrl: '/static/survey/views/locationActivitiesModal.html',
            controller: 'SurveyDetailCtrl',
            scope: {
                question: question ? question : $scope.question.modalQuestion,
                activeMarker: $scope.activeMarker,
                removeLocation: $scope.removeLocation
            },
            success: function(question, answer) {
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
                $scope.dialog.close();
                $scope.dialog = null;
            },
            error: function(arg1, arg2) {
                alert('error confirming');
            },
            cancel: function() {
                $scope.removeLocation($scope.activeMarker);
                $scope.activeMarker = false;
                if (question) {
                    question.update = false;
                }
                $scope.dialog.close();
                $scope.dialog = null;
            }
        });
        $scope.dialog.options.scope.dialog = $scope.dialog;
        $scope.dialog.open();
    }

    $scope.cancelConfirmation = function() {
        if ($scope.dialog) {
            $scope.dialog.options.cancel();
        }
    }

    $scope.editMarker = function(location) {
        if (!location.question) {
            location.question = {};
            angular.extend(location.question, $scope.question.modalQuestion);
        }
        location.question.update = true;    
        $scope.activeMarker = location;
        $scope.confirmLocation(location.question);
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



    $scope.getNextQuestion = function() {
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, $scope.question) + 1];


        return nextQuestion ? nextQuestion.slug : null;
    };

    $scope.getNextQuestionPath = function() {
        var nextQuestion = $scope.getNextQuestion(),
            nextUrl;

        if (nextQuestion) {
            nextUrl = ['survey', $scope.survey.slug, nextQuestion, $routeParams.uuidSlug].join('/');
        } else {
            nextUrl = ['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/');
        }

        return nextUrl;
    };

    $scope.gotoNextQuestion = function() {
        var nextUrl = $scope.getNextQuestionPath();
        if (nextUrl) {
            $location.path(nextUrl);
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
        if (terminate) {
            $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/'));
        }
    };

    $scope.answerQuestion = function(answer, otherAnswer) {

        var url = ['/respond/answer', $scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/');
        if ($scope.dialog) {
            $scope.dialog.options.success($scope.question, answer);
        } else {

            // sometimes we'll have an other field with option text box
            if (answer === 'other' && otherAnswer) {
                answer = otherAnswer;
            }
            if ($scope.question.required && !answer) {
                return false;
            } else if (!$scope.question.required && answer === undefined) {
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
                    }

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

                if ($scope.dialog) {
                    // we are in a dialog and need to handle it
                    $scope.dialog.close();
                    $scope.addLocation();
                } else {
                    if ($scope.question.term_condition && $scope.terminateIf(answer, $scope.question.term_condition)) {
                        $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/'));
                    } else {
                        $scope.answers[$routeParams.questionSlug] = answer;
                        $scope.gotoNextQuestion();
                    }
                }
            }).error(function(data, status, headers, config) {
                if (console) {
                    console.log('error');
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
     * Filters out unselected items and submits an array of the text portion of the
     * selected options.
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
        if (option.checked && option !== question.otherOption) {
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

    // Get a list of the activities that have not yet been mapped.
    var selectedActivities = $scope.getAnswer($scope.question.modalQuestion.hoist_answers.slug);
    // todo: filter out activities that have already been mapped.
    

    var remainingActivities = _.difference(
        _.pluck(selectedActivities, 'text'),
        _.flatten(_.map(locations, function (location) {
            return _.pluck(location.answers, 'text') 
        })));;

    var d = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: false,
        templateUrl: '/static/survey/views/mapContinueModal.html',
        controller: 'MapContinueDialogCtrl',
        resolve: { remainingActivities: function () {
                return angular.copy(remainingActivities); 
            }
        }
    });
    
    d.open().then(function (result) {
        if (result == 'yes') {
            $scope.answerQuestion(locations);
        }
    });
};

});