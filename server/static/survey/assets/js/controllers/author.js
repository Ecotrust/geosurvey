//'use strict';

angular.module('askApp')
  .controller('AuthorCtrl', function ($scope, $http, $routeParams, $location) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';
        $scope.survey = {};
        $scope.activeQuestion = null;
        $scope.questionBeingEdited = null;
        $scope.questionsToBeUpdated = [];
        $scope.updatedQuestionQueue = [];
        if ($routeParams.surveySlug) {    
            $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
                _.extend($scope.survey, data);
                if ($scope.survey.questions.length === 0) {
                    $scope.survey.questions = [];
                    $scope.newQuestion();
                }
                if ($location.search().question && $location.search().question !== 'null') {
                    $scope.startEditingQuestion(_.findWhere($scope.survey.questions, {slug: $location.search().question}))
                } else {
                    $scope.startEditingQuestion($scope.survey.questions[0]);
                }

            });
           
            $scope.$watch('survey.questions', function (newValue) {
                if (newValue && ! $scope.questionsToBeUpdated.length && ! $scope.updatedQuestionQueue.length) {
                   $scope.checkQuestionOrder($scope.survey.questions);
                }
            }, true);
            $scope.$watch('activeQuestion.grid_cols', function (newValue) {
                if (newValue) {
                    _.each(newValue, function (option, i) {
                        if (option.order !== i)
                            option.order = i;
                    }); 
                }
                
            }, true);

        } else {
            $scope.newSurvey = true;
        }

        $scope.checkQuestionOrder = function (questions) {
            _.each(questions, function (question, index) {
                if (question.order !== index) {
                    question.order = index;
                    question.update=true;
                    $scope.questionsToBeUpdated.push(question);
                }
            });
            if ($scope.questionsToBeUpdated.length) {
                $scope.updatedQuestionQueue = [];
                $scope.updateCounter = $scope.updateTotal = $scope.questionsToBeUpdated.length;
                $scope.updateQuestions($scope.questionsToBeUpdated);    
            }
            
        };

        $scope.updateQuestionList = function (questions) {
            _.each(questions, function (question) {
                var index = _.indexOf($scope.survey.questions, _.findWhere($scope.survey.questions, {slug: question.slug}));
                $scope.survey.questions[index] = question;
            });
            $scope.updatedQuestionQueue = [];
            $scope.questionsToBeUpdated = [];
        }

        $scope.updateQuestions = function (questions) {
            var questionToBeUpdated = _.first(questions),
                rest = _.rest(questions);
            $scope.saveQuestion(questionToBeUpdated, true).success(function (newQuestion, status){
                $scope.updatedQuestionQueue.push(newQuestion);
                if (rest.length) {
                    $scope.updateQuestions(rest);    
                    $scope.questionsToBeUpdated = rest;
                    $scope.updateCounter = $scope.updateCounter - 1;
                } else {
                    // $scope.updateQuestionList($scope.updatedQuestionQueue);
                    $scope.updatedQuestionQueue = [];
                    $scope.questionsToBeUpdated = [];

                }                
            })
        }

        $scope.delete = function (question) {
            var questionToBeDeleted = question;
            $http({
                method: 'DELETE',
                url: question.resource_uri,
                data: question
            }).success(function (data) {
                $scope.survey.questions.splice(_.indexOf($scope.survey.questions,
                    _.findWhere($scope.survey.questions, { resource_uri: questionToBeDeleted.resource_uri } )),1);
                $scope.checkQuestionOrder($scope.survey.questions);
                $scope.startEditingQuestion($scope.survey.questions[0]);
            });
        };

        $scope.newQuestion = function () {
            var order = 0;
            if ($scope.survey.questions.length) {
                order = $scope.survey.questions.length + 1;
            }
            $scope.startEditingQuestion({
                label: null,
                slug: null,
                order: $scope.survey.questions.length
            });
        }

        $scope.addBlock = function (question, block) {
            question.blocks.push(block);
            $scope.newBlock = false;
            // $scope.saveQuestion(question).success(function () {
            //     $scope.newBlock = false;    
            // });
            
        };


        $scope.newGridColumn = function (question) {
            var option = {
                text: question.newOptionText,
                label: _.string.slugify(question.newOptionText).replace(/-/g,'')
            };
            $http.post('/api/v1/option/', option).success(function (data) {
                question.grid_cols.push(data);
                question.activeOption = data;
                question.newOption = false;
                question.newOptionText = null;
            });
        };

        $scope.createSurvey = function (survey) {
            survey.slug = _.string.slugify(survey.name);
            $http.post('/api/v1/survey/', $scope.survey).success(function(data) {
                $location.path('/author/' + data.slug);
            });
        }

        $scope.startEditingQuestion = function (question) {
            if (question.grid_cols && question.grid_cols.length) {
                question.grid_cols.sort(function(a, b) {return a.order - b.order});    
            }
            $scope.newBlock = false;
            $scope.confirmDelete = false;
            $scope.activeQuestion = {};
            $scope.questionBeingEdited = question;
            angular.extend($scope.activeQuestion, question);
            $location.search({question:question.slug});
        };

        $scope.questionIsDirty = function(question) {
            return ! _.isEqual(question, $scope.questionBeingEdited);
        };

        $scope.deleteOption = function (option) {
            $http({
                method: 'DELETE',
                url: option.resource_uri,
                data: option
            }).success(function (data) {
                $scope.activeQuestion.grid_cols = _.without($scope.activeQuestion.grid_cols, $scope.activeQuestion.activeOption);
                $scope.activeQuestion.activeOption = false;
            });
        }

        $scope.saveQuestion = function (question, deferUpdatingList) {
            var url = question.resource_uri,
                method = 'PUT',
                data = question;
            if (! question.label) {
                question.label = question.title;
            }
            if (! url) {
                url = '/api/v1/page/';
                method = 'POST';
                data = {
                    survey: { pk: $scope.survey.id },
                    question: question
                }
            }
            $scope.stopWatchingQuestions = true;

            // set empty strings to null
            _.each(question, function (value, key) {
                if (value === '') {
                    question[key] = null;
                }
            });
            return $http({
                method: method,
                url: url,
                data: data
            }).success(function (result, status) {
                var index;
                
                if (status === 202) {
                    if (! deferUpdatingList) {
                        result.grid_cols.sort(function(a, b) {return a.order - b.order});
                        console.log(result.grid_cols);
                        index = _.indexOf($scope.survey.questions, $scope.questionBeingEdited);
                        $scope.survey.questions[index] = result;
                        $scope.questionBeingEdited = result;
                        $scope.stopWatchingQuestions = false;    
                    }
                    
                } else if (status === 201) {
                    if (!$scope.survey.questions) {
                        $scope.survey.questions = [];
                    }
                    if (! deferUpdatingList) {
                        $scope.survey.questions.push(result.question);
                        $scope.questionBeingEdited = result.question;    
                    }
                    
                }
                
                $scope.startEditingQuestion($scope.questionBeingEdited);
                $scope.activeQuestion.updated_at = new Date();
            });
        };
  });
