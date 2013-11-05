angular.module('askApp').directive('multiquestion', function() {
    return {
        templateUrl: app.viewPath + 'views/multiQuestionTypes.html',
        restrict: 'EA',
        // replace: true,
        transclude: true,
        scope: {
            question: '=question',
            pageorder: '=pageorder',
            answers: '=answers',
            validity: '=validity'
        },
        link: function postLink(scope, element, attrs) {
                scope.validateQuestion = function (question) {
                // if the question is not required it is good to go
                if (! question.required) {
                    return true;
                }
                
                if (question.type === 'integer' || question.type === 'number') {
                    if (! _.isNumber(question.answer)) {
                        return false;
                    }
                    if (question.integer_max && question.integer_max < question.answer) {
                        return false;
                    }
                    if (question.integer_min || question.integer_min > question.answer) {
                        return false;
                    }
                    if (question.type === 'integer' && _.string.include(question.answer, '.')) {
                        return false;
                    }
                }

                if (question.type === 'text' || question.type === 'textarea') {
                    if (! question.answer) {
                        return false;
                    }
                }
                var otherAnswers = question.otherAnswers && question.otherAnswers.length && ( ! (question.otherAnswers.length === 1 && question.otherAnswers[0] === "") );
                if (question.type === 'single-select') {

                    return _.some(_.pluck(question.options, 'checked')) || otherAnswers;  

                } else if ( question.type === 'multi-select' || question.type === 'yes-no' ) {                
                    
                    var otherEntry = otherAnswers, 
                        standardEntry = false;
                    
                    if (otherEntry) {
                        return true;
                    } else {
                        if (question.groupedOptions && question.groupedOptions.length) {  
                            return _.some(_.pluck(_.flatten(_.map(question.groupedOptions, function (group) { return group.options })), 'checked'));
                        } else {
                            return _.some(_.pluck(question.options, 'checked')) || question.otherAnswers.length;        
                        }
                    }

                    // if ( question.allow_other && question.otherOption.checked && ! otherAnswers ) {
                    //     return false;
                    // }
                    // if ( question.allow_other && ! question.otherAnswers ) {
                    //     return false;                        
                    // } else if (! question.otherOption.checked) {

                    //     if (question.groupedOptions && question.groupedOptions.length) {  
                    //         return _.some(_.pluck(_.flatten(_.map(question.groupedOptions, function (group) { return group.options })), 'checked'));
                    //     } else {
                    //         return _.some(_.pluck(question.options, 'checked')) || question.otherAnswers.length;        
                    //     }
                    // }
                    
                }
                
                if (question.type === 'number-with-unit') {
                    if (! _.isNumber(question.answer) || ! question.unit) {
                        return false;    
                    }
                }

                if ((question.type === 'monthpicker' || question.type == 'datepicker' || question.type === 'timepicker') && ! question.answer) {
                    return false;
                }


                // default case
                return true;
            };


            // get previously answered questions
            scope.getAnswer = function(questionSlug) {
                var slug, gridSlug;
                if (_.string.include(questionSlug, ":")) {
                    slug = questionSlug.split(':')[0];
                    gridSlug = questionSlug.split(':')[1].replace(/-/g, '');
                } else {
                    slug = questionSlug;
                }

                if (scope.answers[slug] || scope.answers[slug] === 0) {
                    if (gridSlug) {
                        return _.flatten(_.map(scope.answers[slug], function(answer) {
                            if (_.isArray(answer[gridSlug])) {
                                return _.map(answer[gridSlug], function(gridAnswer) {
                                    return {
                                        text: answer.text + ": " + gridAnswer,
                                        label: _.string.slugify(answer.text + ": " + gridAnswer),
                                        value: gridAnswer
                                    };
                                });   
                            } else {
                                return answer[gridSlug];
                            }
                        }));
                    } else {
                        return scope.answers[slug];
                    }
                } else {
                    return false;
                }
            };

            scope.getSum = function(slugPackage) {
                //split the string
                var slugList = slugPackage.split(',');
                //map to get the answer for each slug
                //reduce to get the sum
                return _.reduce(_.flatten(_.map(slugList, function(slug) {
                    return scope.getAnswer(slug);
                })), function(sum, value) {                    
                    if (_.isObject(value)) {
                        value = value.value;
                    }
                    return sum + value;
                });

            };


            // scope.question.otherAnswers = [];
            // handle clicked multiselects
            scope.onMultiSelectClicked = function(option, question) {
                option.checked = !option.checked;
                // if (!option.checked && option.other) {
                //     // $scope.question.otherAnswer1 = null;
                //     // $scope.question.otherAnswer2 = null;                    
                //     // $scope.question.otherAnswer = null;
                //     // $scope.question.otherAnswers[0] = null;
                //     // $scope.question.otherAnswers[1] = null;
                //     // $scope.question.otherAnswers[2] = null;
                // }
                question.answerSelected = _.some(_.pluck(_.flatten(_.map(question.groupedOptions, function(option) {
                    return option.options;
                })), 'checked'));
            };

            // handle single select clicks
            scope.onSingleSelectClicked = function(option, question) {
                // turn off all other options
                _.each(_.without(question.options, option), function(option) {
                    option.checked = false;
                });

                if (question.otherOption && option === question.otherOption) {
                    question.otherOption.checked = !question.otherOption.checked;
                } else {
                    if (question.otherOption) {
                        question.otherOption.checked = false;
                    }
                }
                option.checked = !option.checked;

                if (option.checked && option.label) { // if option is checked but it's not an other option, then clear out other option
                    question.otherAnswers = [];
                }

                // if (question.otherAnswers.length) {
                //     option.checked = true;
                // }
                question.answerSelected = option.checked;


                // enable continue
                // if (!question.required || (option.checked && option !== question.otherOption)) {
                //     $scope.isAnswerValid = true;
                // } else {
                //     $scope.isAnswerValid = false;
                // }

            };


            // get simple answers
            scope.question.answer = scope.getAnswer(scope.question.slug);

            // set up rows for selects
            if (scope.question.rows) {
                scope.question.options = [];
                _.each(scope.question.rows.split('\n'), function(row, index) {
                    var matches = [],
                        option;
                    if (_.isArray(scope.question.answer)) {
                        matches = _.filter(scope.question.answer, function(answer) {
                            return answer.text === row;
                        });
                    } else if (row === scope.question.answer.text) {
                        // handle single selects
                        matches = [true];
                    }
                    option = {
                        text: _.string.startsWith(row, '*') ? row.substr(1) : row,
                        label: _.string.slugify(row),
                        checked: matches.length ? true : false,
                        isGroupName: _.string.startsWith(row, '*')
                    };
                    if (option.checked) {
                        scope.question.answerSelected = true;
                    }
                    scope.question.options.push(option);
                });

                scope.question.groupedOptions = [];
                scope.question.answerSelected = false;
                var groupName = "";
                
                _.each(scope.question.rows.split('\n'), function(row, index) {
                    var matches = [];
                    if (scope.question.answer && scope.question.answer.length) {
                        matches = _.filter(scope.question.answer, function(answer) {
                            return answer.text === row;
                        });                        
                    } 
                    var isGroupName = _.string.startsWith(row, '*');
                    var group;
                    if (isGroupName) {
                        groupName = row.substr(1);
                        group = {
                            optionLabel: groupName,
                            options: [],
                            open: false
                        };
                        scope.question.groupedOptions.push(group);
                    } else if (scope.question.groupedOptions.length > 0) {
                        group = _.findWhere(scope.question.groupedOptions, {
                            optionLabel: groupName
                        });
                        group.options.push({
                            text: row,
                            label: _.string.slugify(row),
                            groupName: groupName,
                            checked: matches.length ? true : false
                        });
                        if (matches.length) {
                            scope.question.answerSelected = true;
                            group.open = true;
                            // console.log(group.optionLabel);
                        }
                    }
                });

            }

            // set up other option
            if (scope.question.allow_other && scope.question.answer && scope.question.answer.other || _.isArray(scope.question.answer) && _.findWhere(scope.question.answer, { other: true }) ) {
                scope.question.otherOption = {
                    'checked': true,
                    'other': true
                };

                if (scope.question.answer.other) {
                    scope.question.otherAnswers = [];
                    scope.question.otherAnswers[0] = scope.question.answer.text;
                } else {
                    scope.question.otherAnswers = _.where(scope.question.answer, { other: true });
                    _.each(scope.question.otherAnswers, function(answer, i) {
                        scope.question.otherAnswers[i] = answer.text;
                    });
                }

                
                // scope.question.otherAnswer = scope.question.answer.text || _.findWhere(scope.question.answer, {
                //     other: true
                // }).text;
            } else {
                scope.question.otherOption = {
                    'checked': false,
                    'other': true
                };
                // scope.question.otherAnswer = null;
                scope.question.otherAnswers = [];
            }        

            // set up the options for a yes-no question
            if (scope.question.type === 'yes-no') {
                if (scope.question.answer && _.isArray(scope.question.answer)) {
                    scope.question.options = [{
                        'text': 'Yes',
                        'label': "Yes",
                        checked: scope.question.answer[0].text === 'Yes'
                    }, {
                        'text': 'No',
                        'label': "No",
                        checked: scope.question.answer[0].text === 'No'
                    }];
                } else if (scope.question.answer && !_.isArray(scope.question.answer)) {
                    scope.question.options = [{
                        'text': 'Yes',
                        'label': "Yes",
                        checked: scope.question.answer.text === 'Yes'
                    }, {
                        'text': 'No',
                        'label': "No",
                        checked: scope.question.answer.text === 'No'
                    }];
                } else {
                    scope.question.options = [{
                        'text': 'Yes',
                        'label': "Yes",
                        checked: false
                    }, {
                        'text': 'No',
                        'label': "No",
                        checked: false
                    }];
                }

            }



            // get answers
            if (scope.question.type === 'number-with-unit') {
                scope.question.unit = scope.question.answer.unit;
                scope.question.answer = scope.question.answer.value;
            } else if (scope.question.type === 'integer') {
                scope.question.answer = parseInt(scope.getAnswer(scope.question.slug), 10);
            } else if (scope.question && scope.question.options.length) {
                scope.question.answer = scope.getAnswer(scope.question.slug);
                // check to make sure answer is in options
                if (scope.question.answer && !_.isArray(scope.question.answer)) {
                    scope.question.answer = [scope.question.answer];
                }
            }
            // end of getting answers

            if (scope.question.pre_calculated && !scope.question.answer) {
                scope.question.answer = scope.getSum(scope.question.pre_calculated);
            }

            // remove false answers

            if (!scope.question.answer && scope.question.answer !== 0) {
                delete scope.question.answer;
            }

            if (scope.question.type === 'single-select' || scope.question.type === 'yes-no') {
                scope.question.answerSelected = _.some(_.pluck(scope.question.options, 'checked'));
                if (scope.question.allow_other && scope.question.answer && scope.question.answer.other || _.isArray(scope.question.answer) && _.findWhere(scope.question.answer, {other: true })) {
                    scope.question.answerSelected = true;
                }
            } else if (scope.question.type === 'multi-select') {
                scope.question.answerSelected = _.some(_.pluck(_.flatten(_.map(scope.question.groupedOptions, function(option) {
                    return option.options;
                })), 'checked'));
            }

            scope.$watch('question', function () {
                scope.validity[scope.question.slug] = scope.validateQuestion(scope.question);
            }, true);


            scope.$watch('question.otherAnswers', function () {
                if (scope.question.type == 'single-select' && scope.question.allow_other && scope.question.otherAnswers.length && scope.question.otherAnswers[0] !== "") {
                    scope.onSingleSelectClicked({checked: false}, scope.question);
                } else if (scope.question.type == 'single-select' && scope.question.allow_other) {
                    scope.onSingleSelectClicked({checked: true}, scope.question);
                }
            }, true);

        }
    };
});