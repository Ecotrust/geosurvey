angular.module('askApp')
    .controller('SurveyDetailCtrl', function($scope, $routeParams, $http, $location, $dialog, $interpolate, $timeout) {
        $scope.loading=true;
        $scope.path = $location.path().slice(1,5);
        if (app.user) {
            $scope.user = app.user;
        } else if (app.offline) {
            if (!app) {
                app = {};
            }
            app.next = $location.path();
            $location.path('/');
            return false;
        }

    $scope.survey = {
        state: 'loading'
    };

    $scope.answers = {};

    $scope.isAuthenticated = isAuthenticated;

    // landing page view
    $scope.landingView = 'survey-pages/' + $routeParams.surveySlug + '/landing.html';


    $scope.gotoNextQuestion = function(numQsToSkips) {
        var nextUrl = $scope.getNextQuestionPath(numQsToSkips);
        if (nextUrl) {
            $location.path(nextUrl);
        }
    };

    $scope.gotoQuestion = function (questionSlug) {
        $location.path(['survey', $scope.survey.slug, questionSlug, $routeParams.uuidSlug, $routeParams.action].join('/'));
    }

    $scope.getNextQuestionPath = function(numQsToSkips) {
        var nextPage = $scope.getPageFromQuestion($scope.getNextQuestion(numQsToSkips));
    
        if (nextPage) {
            return ['survey', $scope.survey.slug, nextPage.order, $routeParams.uuidSlug].join('/');
        } else {
            return ['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug, $routeParams.action].join('/');
        }
    };

    $scope.deleteAnswer = function (questionSlug, uuidSlug) {
        var index;
        
        if (app.offline) {
            if ($scope.answers[questionSlug]) {
                delete $scope.answers[questionSlug];
            }
            _.each(app.respondents[uuidSlug].responses, function (response, i) {
                if (response.question.slug === questionSlug) {
                    index = i;
                }
            });
            if (index) {
                app.respondents[uuidSlug].responses.splice(index, 1);
            }
            $scope.saveState();
        }
        
    }

    $scope.getLastQuestion = function (numQsToSkips) {
        var index = _.indexOf($scope.survey.questions, $scope.question), lastQuestion = false;
        while (index >= 0 && ! lastQuestion) {
            index--;
            if ($scope.survey.questions[index] && _.has($scope.answers, $scope.survey.questions[index].slug)) {
                lastQuestion = $scope.survey.questions[index]
            }
        }
        return lastQuestion;
    }

    $scope.getNextQuestionWithSkip = function(numQsToSkips) {
        var index = _.indexOf($scope.survey.questions, $scope.question) + 1 + (numQsToSkips || 0);
        // should return the slug of the next question
        var nextQuestion = $scope.survey.questions[index];
        //if (nextQuestion && nextQuestion.blocks && nextQuestion.blocks.length) {
        
        if (nextQuestion) {
            if ($scope.skipIf(nextQuestion)) {
                $scope.deleteAnswer(nextQuestion, $routeParams.uuidSlug);
                nextQuestion = false;
            }
        } 

        return nextQuestion ? nextQuestion.slug : false;
    };


    $scope.getNextQuestion = function(numQsToSkips) {
        var foundQuestion = false, index = numQsToSkips || 0;
        while (foundQuestion === false && index < $scope.survey.questions.length) {
            foundQuestion = $scope.getNextQuestionWithSkip(index);
            index++;
        }
        return foundQuestion;
    };

    $scope.getNextPageWithSkip = function(numPsToSkips) {
        var index = _.indexOf($scope.survey.pages, $scope.page) + 1 + (numPsToSkips || 0);
        var nextPage = $scope.survey.pages[index];
        
        if (nextPage) {
            if ($scope.skipPageIf(nextPage)) {
                _.each(nextPage.questions, function (question) {
                    $scope.deleteAnswer(question, $routeParams.uuidSlug);
                });
                
                nextPage = false;
            }
        } 

        return nextPage ? nextPage : false;
    };


    $scope.getNextPage = function(numPsToSkips) {
        var foundPage = false, index = numPsToSkips || 0;
        while (foundPage === false && index < $scope.survey.pages.length) {
            foundPage = $scope.getNextPageWithSkip(index);
            index++;
        }
        return foundPage;
    };

    $scope.getPageFromQuestion = function(questionSlug) {
        return _.find($scope.survey.pages, function (page) {
            return _.findWhere(page.questions, {slug: questionSlug});
        });
    };

    $scope.getResumeQuestionPath = function(lastQuestion) {
        
        var resumeQuestion = $scope.survey.questions[_.indexOf($scope.survey.questions, _.findWhere($scope.survey.questions, {
            slug: lastQuestion
        })) + 1];
        return ['survey', $scope.survey.slug, resumeQuestion.slug, $routeParams.uuidSlug].join('/');
    };
    
    $scope.getResumePage = function (lastQuestion) {
        var resumePage = $scope.getPageFromQuestion(lastQuestion);
        return ['survey', $scope.survey.slug, resumePage.order, $routeParams.uuidSlug].join('/');
    }

    /* () */ 
    $scope.shouldSkipNextQuestion = function (currentQuestionSlug, currentAnswer, callback) {
        switch(currentQuestionSlug) 
        {
        case 'state':
            $http.get('surveys/counties/' + (currentAnswer || {}).label + '.json')
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

    $scope.keepQuestion = function(op, answer, testCriteria) {
        if (op === '<') {
            return !isNaN(answer) && answer >= testCriteria;
        } else if (op === '>') {
            return !isNaN(answer) && answer <= testCriteria;
        } else if (op === '=') {
            if ( !isNaN(answer) ) { // if it is a number
                return answer !== testCriteria;
            } else if (_.str.include(testCriteria, '|')) { // if condition is a list
                // keep if intersection of condition list and answer list is empty
                return _.intersection( testCriteria.split('|'), answer ).length === 0;
            } else { // otherwise, condition is a string, keep if condition string is NOT contained in the answer
                return ! _.contains(answer, testCriteria);
            }
        } else if (op === '!') {  
            if ( !isNaN(answer) ) { // if it is a number
                // keep the question if equal (not not equal)
                return answer === testCriteria;
            } else if (_.str.include(testCriteria, '|')) { // if condition is a list
                // keep if intersection of condition list and answer list is populated
                return _.intersection( testCriteria.split('|'), answer ).length > 0 ;
            } else { // otherwise, condition is a string, keep if condition string is contained in the answer
                return _.contains(answer, testCriteria);
            }
        }
        return undefined;
    };
    
    $scope.getAnswer = function(questionSlug) {
        var slug, gridSlug;
        if (_.string.include(questionSlug, ":")) {
            slug = questionSlug.split(':')[0];
            gridSlug = questionSlug.split(':')[1].replace(/-/g, '');
        } else {
            slug = questionSlug;
        }
        
        if ($scope.answers[slug]) {
            if (gridSlug) {
                return _.flatten(_.map($scope.answers[slug], function (answer) {
                    return _.map(answer[gridSlug], function (gridAnswer){
                        return {
                            text: answer.text + ": " + gridAnswer,
                            label: _.string.slugify(answer.text + ": " + gridAnswer)
                        }
                    });
                }));
            } else {
                return $scope.answers[slug];
            }
        } else {
            return false;
        }
    };

    $scope.skipPageIf = function(nextPage) {
        var keep = true;
        
        if ( nextPage.blocks && nextPage.blocks.length ) {
            var blocks = nextPage.blocks;
        } else if ( nextPage.skip_question && nextPage.skip_condition ) {
            var blocks = [nextPage];
        } else {
            var blocks = []; //(return false)
        }
          
        _.each(blocks, function(block) {
            var questionSlug = _.findWhere($scope.survey.questions, {resource_uri: block.skip_question}).slug,
                answer = $scope.getAnswer(questionSlug),
                condition = block.skip_condition,
                op = condition[0],
                testCriteria = condition.slice(1);
                
            if (_.isObject(answer)) {
                if (_.isNumber(answer.answer)) {
                    answer = answer.answer;
                } else if (_.isArray(answer)) {
                    answer = _.pluck(answer, "text");
                } else if (_.isArray(answer.answer)) {
                    answer = _.pluck(answer.answer, "text");
                } else {
                    answer = [answer.answer ? answer.answer.text : answer.text];    
                }
            }
            
            keep = keep && $scope.keepQuestion(op, answer, testCriteria);
        });
        
        return !keep;
    };


    $scope.skipIf = function(nextQuestion) {
        var keep = true;
        
        if ( nextQuestion.blocks && nextQuestion.blocks.length ) {
            var blocks = nextQuestion.blocks;
        } else if ( nextQuestion.skip_question && nextQuestion.skip_condition ) {
            var blocks = [nextQuestion];
        } else {
            var blocks = []; //(return false)
        }
          
        _.each(blocks, function(block) {
            var questionSlug = _.findWhere($scope.survey.questions, {resource_uri: block.skip_question}).slug,
                answer = $scope.getAnswer(questionSlug),
                condition = block.skip_condition,
                op = condition[0],
                testCriteria = condition.slice(1);
                
            if (_.isObject(answer)) {
                if (_.isNumber(answer.answer)) {
                    answer = answer.answer;
                } else if (_.isArray(answer)) {
                    answer = _.pluck(answer, "text");
                } else if (_.isArray(answer.answer)) {
                    answer = _.pluck(answer.answer, "text");
                } else {
                    answer = [answer.answer ? answer.answer.text : answer.text];    
                }
            }
            
            keep = keep && $scope.keepQuestion(op, answer, testCriteria);
        });
        
        return !keep;
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

    $scope.answerOffline = function(answer) {
        $scope.deleteAnswer(answer.question.slug, $routeParams.uuidSlug);
        app.respondents[$routeParams.uuidSlug].responses.push({
            answer: answer.answer,
            question: answer.question
        });

        // this should give us pause
        $scope.answers[answer.question.slug] = answer;
        $scope.saveState();
    };

    $scope.saveState = function () {
        localStorage.setItem('hapifish', JSON.stringify(app));
    };


    $scope.submitPage = function (page) {
        var answers = _.map(page.questions, function (question) {
            return $scope.getAnswerOnPage(question);
        });
        if (app.offline) {
            _.each(answers, function (answer){
                $scope.answerOffline(answer);
            });
            $scope.gotoNextPage();
        } else {
            $http({
                url: ['/respond/submitPage', $scope.survey.slug, $routeParams.uuidSlug].join('/'),
                method: 'POST',
                data: {
                    'answers': _.map(answers, function (answer) {
                        return {
                            slug: answer.question.slug,
                            answer: answer.answer
                        }
                    })
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (response, status, getHeaders, request) {
                _.each(request.data.answers, function (answer){
                    $scope.answers[answer.slug] = answer.answer;
                    if (!app.data.responses) {
                        app.data.responses = [];
                    }

                    app.data.responses.push({
                        answer: answer.answer,
                        question: _.findWhere($scope.page.questions, {slug: answer.slug})
                    });
                });
                $scope.gotoNextPage();
            });    
        }
        
    };

    $scope.gotoNextPage = function () {
        var nextPage = $scope.getNextPage();
        if (nextPage) {
            $location.path(['survey', $scope.survey.slug, nextPage.order, $routeParams.uuidSlug].join('/'));
        } else {
            $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug, $routeParams.action].join('/'));
        }
    }


    $scope.gotoLastPage = function () {
        $location.path(['survey', $scope.survey.slug, $scope.page.order - 1, $routeParams.uuidSlug].join('/'));
    }



    $scope.getAnswerOnPage = function(question) {
        var answer = question.answer;
        
        if (question.type === 'integer' || question.type === 'number') {
            if (question.integer_max && question.integer_max < answer) {
                answer = "NA";
            }
            if (question.integer_min || question.integer_min > answer) {
                answer = "NA";
            }
            if (question.type === 'integer' && _.string.include(answer, '.')) {
                answer = "NA";
            }
            // if (answer === undefined) {
                // answer = 0;
            // }
        }
        
        //var url = ['/respond/answer', survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/');
        if (question.type === 'timepicker' || question.type === 'datepicker' || question.type === 'monthpicker') {
            if ( ! answer ) {
                answer = new Date();
            }
        }

        if (question.type === 'multi-select') {
            answer = $scope.answerMultiSelect(question);
        }

        if (question.type === 'single-select' || question.type === 'yes-no') {
            answer = $scope.answerSingleSelect(question);
        }

        // sometimes we'll have an other field with option text box
        if (answer === 'other' && question.otherAnswer) {
            answer = question.otherAnswer;
        }
        if (question.required && (answer === undefined || answer === null)) {
            return false;
        } else if (!question.required && (answer === undefined || answer === null)) {
            answer = '';
        }



        // for number with unit questions, we need to submit a unit as well
        if (question.type === 'number-with-unit') {
            answer = {
                value: question.answer,
                unit: question.unit
            }    
        }
        
        if (question.type === 'grid') {
            //check for undefined answers on the grid
            var completed = ! _.some( _.map(question.options, function(option) { return _.contains(_.values(option), undefined); }));
            if (completed || !question.required) {
                answer = question.options;
            } else {
                return false;
            }
            delete question.gridOptions; // was causing a circular reference in 
        }

        if ( answer !== 0 && !answer) {
            answer = "NA";
        }

        return { question: question, answer: answer };
    };
    
    /* not used, replaced by submitPage */
    $scope.answerQuestion = function(answer, otherAnswer, unit) {
        if ($scope.question.type === 'integer' || $scope.question.type === 'number') {
            if ($scope.question.interger_max && $scope.question.integer_max < answer) {
                return false;
            }
            if ($scope.question.integer_min || $scope.question.integer_min > answer) {
                return false;
            }
            if ($scope.question.type === 'integer' && _.string.include($scope.answer, '.')) {
                return false;
            }
        }

        var url = ['/respond/answer', $scope.survey.slug, $routeParams.questionSlug, $routeParams.uuidSlug].join('/');

        if ($scope.question.type === 'timepicker' || $scope.question.type === 'datepicker') {
            if (! $scope.answer) {
                answer = $scope.now;
            }
        }

        // sometimes we'll have an other field with option text box
        if (answer === 'other' && otherAnswer) {
            answer = otherAnswer;
        }
        if ($scope.question.required && (answer === undefined || answer === null)) {
            return false;
        } else if (!$scope.question.required && (answer === undefined || answer === null)) {
            answer = '';
        }

        // for number with unit questions, we need to submit a unit as well
        if ($scope.question.type === 'number-with-unit') {
            answer = {
                value: answer,
                unit: unit
            }    
        }
        

        if (app.offline) {
            $scope.answerOffline({
                answer: answer,
                question: $scope.question
            });
        } else {
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
                  
                    if ($scope.question.term_condition && $scope.terminateIf(answer, $scope.question.term_condition)) {
                        $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug, 'terminate', $routeParams.questionSlug].join('/'));
                    } else {
                        $scope.answers[$routeParams.questionSlug] = answer;
                        if (!app.data.responses) {
                            app.data.responses = [];
                        }

                        app.data.responses.push({
                            answer: answer,
                            question: $scope.question
                        });
                        $scope.gotoNextQuestion();
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
            

            }).error(function(data, status, headers, config) {
                if (console) {
                    console.log(data);
                }
            });
        }
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
        
        // in case of multiselect containing groups 
        if (question.groupedOptions.length) {
            answers = [];
            _.each(question.groupedOptions, function(groupedOption) {
                answers = answers.concat(_.filter(groupedOption.options, function(option) {
                    return option.checked;
                }));
            });
        }

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
        
        // if (!$scope.isAnswerValid) {
        //     return;
        // }

        if (question.hoisted_options) {
            question.options = question.options.concat(question.hoisted_options);
        }
        answers = _.filter(question.options, function(option) {
            return option.checked;
        });
        
        // in case of multiselect containing groups 
        if (question.groupedOptions.length) {
            answers = [];
            _.each(question.groupedOptions, function(groupedOption) {
                answers = answers.concat(_.filter(groupedOption.options, function(option) {
                    return option.checked;
                }));
            });
        }

        if (question.otherAnswer) {
            answers.push({
                text: question.otherAnswer,
                label: question.otherAnswer,
                checked: true,
                other: true
            });
        }
        
        //_.each(answers, function(answer) {
            //answer.text = encodeURIComponent(answer.text);
        //});
        return answers;
    };

    

    $scope.$watch('question.otherAnswer', function(newValue) {

        if ($scope.question && $scope.question.required && !$scope.answer) {
            if ($scope.question.allow_other && $scope.question.otherOption && $scope.question.otherOption.checked && $scope.question.otherAnswer && $scope.question.otherAnswer.length > 0) {
                $scope.isAnswerValid = true;
            } else {
                $scope.isAnswerValid = false;
            }
        } else {
            $scope.isAnswerValid = true;
        }
    });


    $scope.answerSingleSelect = function(question) {
        var answer = _.find(question.options, function(option) {
            return option.checked;
        });
        //var copy = {};
        //_.extend(copy, answer);
         if (! answer && question.otherAnswer) {
            answer = {
                checked: true,
                label: question.otherAnswer,
                text: question.otherAnswer,
                other: true
            };
        } else if (!question.required && question.type !== 'yes-no') {
            // No answer given. Submit empty.
           answer = {
                text: 'NO_ANSWER'
            };
        }
        return answer;
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


$scope.loadSurvey = function(data) {
        $scope.survey = data.survey;
        $scope.survey.status = data.status;
        if (! $routeParams.action === 'edit' && data.status === 'complete' || data.status === 'terminate') {
            $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/'));
        }

        _.each(data.responses, function(response) {
            try {
                $scope.answers[response.question.slug] = JSON.parse(response.answer_raw);
            } catch (e) {
                $scope.answers[response.question.slug] = response.answer;
            }
        });

        if (data.last_question && !data.complete) {
            $scope.resumeQuestionPath = $scope.getResumePage(data.last_question);
        } else {
            $scope.resumeQuestionPath = 'NO_RESUME';
        }
        // if (data.complete) {
        //     $location.path(['survey', $scope.survey.slug, 'complete', $routeParams.uuidSlug].join('/'));
        // }
        // we may inject a question into the scope
        if ($routeParams.pageID) {
            $scope.page = _.findWhere($scope.survey.pages, { order: parseInt($routeParams.pageID, 10) });
            if (!$scope.page) {
                $scope.page = {
                    questions: []
                };
            }
        } else if (!$scope.question) {
            $scope.question = _.findWhere($scope.survey.questions, { slug: $routeParams.questionSlug });
        }



        _.each($scope.page.questions, function (question) {
            if (question.rows.length && ! question.options) {
                question.options = [];
            }
        });

        if ($scope.question && $scope.question.title) {
            $scope.question.displayTitle = $interpolate($scope.question.title)($scope);
        }

        if ($scope.question && $scope.question.type === 'info' && $scope.question.info) {
            $scope.infoView = 'survey-pages/' + $routeParams.surveySlug + '/' + $scope.question.info + '.html';

        }

        /* Specific to single and multi select for now. */
        $scope.isAnswerValid = $scope.question && !$scope.question.required;




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

                _.each($scope.question.options, function(option) {

                    if (_.contains(previousAnswers, option.text)) {
                        option.checked = true;
                    } else {
                        option.checked = false;
                    }
                    
                    //distinguish group titles
                    if ( _.startsWith(option.text, '*') ) {
                        option.text = _.splice(option.text, 1);
                        option.isGroupName = true;
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

            $http.get('surveys/counties/' + stateAbrv + '.json').success(function(data, status, headers, config) {
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

        $scope.nextQuestionPath = $scope.getNextQuestionPath();
        $scope.loading = false;
    };
    $scope.viewPath = app.viewPath;

    if ($routeParams.uuidSlug && ! _.string.startsWith($routeParams.uuidSlug, 'offline') && app.offline) {
        $http.get(app.server + '/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
            app.data = {
                survey: data
            };
            $scope.loadSurvey({
                survey: data
            });
        });
    } else if ($routeParams && app.data && $routeParams.uuidSlug === app.data.uuid) {
        // online surveys that have already been started
        $scope.loadSurvey({
            survey: app.data.survey,
            responses: app.data.responses
        });
    } else if ($routeParams && _.string.startsWith($routeParams.uuidSlug, 'offline') && app.offline) {
        var ts = new Date();
        // this is an offline survey
        if ($routeParams.uuidSlug === 'offline') {
            // this is a new offline survey
            $scope.answers = [];
            if (!app.respondents) {
                app.respondents = {};
            }
            $routeParams.uuidSlug = 'offline_' + ts.getTime();
            app.respondents[$routeParams.uuidSlug] = {
                uuid: $routeParams.uuidSlug,
                survey: $routeParams.surveySlug,
                ts: ts,
                responses: []
            }
            $scope.saveState();
            $location.path(['survey', $routeParams.surveySlug, 1, $routeParams.uuidSlug].join('/'));
        } else {
            // this is an old offline survey
            $scope.loadSurvey({
                    survey: angular.copy(_.findWhere(app.surveys, {
                        slug: $routeParams.surveySlug
                    })),
                    responses: app.respondents[$routeParams.uuidSlug].responses
                });
        }
        
    } else {
        $http.get(app.server + '/api/v1/respondant/' + $routeParams.uuidSlug + '/?format=json').success(function(data) {
            app.data = data;
            $scope.loadSurvey(data);
        }).error(function(data, status, headers, config) {
            $scope.survey.status = 'invalid';
        });    
    }
});
