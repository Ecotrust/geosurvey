//'use strict';

angular.module('askApp')
  .controller('AuthorCtrl', function ($scope, $http, $routeParams, $location) {
        $http.defaults.headers.post['Content-Type'] = 'application/json';
        $scope.survey = {};
        $scope.activeQuestion = null;
        $scope.activePage = null;

        $scope.questionBeingEdited = null;
        $scope.pageBeingEdited = null;
        
        $scope.questionsToBeUpdated = [];
        $scope.updatedQuestionQueue = [];

        $scope.pagesToBeUpdated = [];
        $scope.updatedpagesQueue = [];

      

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
   

            
            $scope.$watch('survey.pages', function (newValue) {
                if (newValue){// && ! $scope.questionsToBeUpdated.length && ! $scope.updatedQuestionQueue.length) {
                   $scope.checkPageOrder(newValue);
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

        $scope.getPageFromQuestion = function(questionSlug) {
            return _.find($scope.survey.pages, function (page) {
                return _.findWhere(page.questions, {slug: questionSlug});
            });
        };

        $scope.checkPageOrder = function (pages) {
            var pagesToUpdate = [];
            _.each(pages, function (page, index) {
                if (page.updateQuestions) {
                    pagesToUpdate.push(page);
                    page.updateQuestions = false;
                }
                if (! page.updating) {
                    _.each(page.questions, function (question, index) {
                        $scope.checkingPages = true;
                        if (question.order !== index + 1) {
                            question.order = index + 1;
                            page.updating = true;
                            $scope.saveQuestion(question).success(function () {
                                page.updating = false;
                            });     
                        }
                    });
                    if (page.order !== index + 1) {
                        page.order = index + 1;
                        $scope.savePage(page);
                    }
                };
            });
            _.each(pagesToUpdate, function (page) {
                $scope.savePage(page).success(function () { page.updating = false; });;
            });
        };

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
            // save questions, defer updates and perform a patch
            $scope.saveQuestion(questionToBeUpdated, true, true).success(function (newQuestion, status){
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

        $scope.updatePages = function (pages) {
            var pageToBeUpdated = _.first(pages),
                rest = _.rest(pages);
            $scope.savePage(pageToBeUpdated, true).success(function (newPage, status){
                $scope.updatedPageQueue.push(newPage);
                if (rest.length) {
                    $scope.updatePages(rest);    
                    $scope.pagesToBeUpdated = rest;
                    $scope.updateCounter = $scope.updateCounter - 1;
                } else {
                    // $scope.updatepageList($scope.updatedpageQueue);
                    $scope.updatePageQueue = [];
                    $scope.pagesToBeUpdated = [];

                }                
            })
        }


        $scope.delete = function (question, page) {
            var questionToBeDeleted = question;
            $http({
                method: 'DELETE',
                url: question.resource_uri,
                data: question
            }).success(function (data) {
                page.questions.splice(_.indexOf(page.questions,
                    _.findWhere(page.questions, { resource_uri: questionToBeDeleted.resource_uri } )),1);
                // $scope.checkQuestionOrder($scope.survey.questions);
                // $scope.startEditingQuestion($scope.survey.questions[0]);
            });
        };

        $scope.newQuestion = function (page) {
            var order = 0;
            page.active = true;
            if (page.questions.length) {
                order = page.questions.length + 1;
            }
            $scope.startEditingQuestion({
                label: null,
                slug: null,
                order: order
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

        $scope.addPage = function () {
            $scope.addingPage = true;
            $http.post('/api/v1/page/', { survey: '/api/v1/survey/' + $scope.survey.slug + '/'}).success(function(data) {
                $scope.survey.pages.push(data);
                $scope.addingPage = false;
            });
        }


        $scope.startEditingPage = function (page) {
            $scope.pageBeingEdited = page;
            $scope.activePage = {};
            angular.extend($scope.activePage, page);
            _.each($scope.survey.pages, function (page) {
                if (page !== $scope.pageBeingEdited && page.active) {
                    page.active = false;
                }
            });
        };

        $scope.startEditingQuestion = function (question) {
            if (! question) {
                return;
            }
            if (question.grid_cols && question.grid_cols.length) {
                question.grid_cols.sort(function(a, b) {return a.order - b.order});    
            }
            $scope.newBlock = false;
            $scope.confirmDelete = false;
            $scope.questionBeingEdited = question;
            $scope.activeQuestion = angular.copy(question);
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


        $scope.savePage = function (page, question) {
            var url = page.resource_uri,
                method = 'PUT',
                data = { 
                    order: page.order,
                    questions: _.map(page.questions, function (question) {
                        return {pk: question.id}
                    }),
                    blocks: _.map(page.blocks, function (block) {
                        return {pk: block.id}
                    })
                };
            // page.updating = true;
            if (question) {
                data.questions.push({ pk: question.id });
            }
            return $http({
                method: method,
                url: url,
                data: data
            }).success(function (result, status) {
               page.updating = false;
            });  
        };


        $scope.saveQuestion = function (question, deferUpdatingList, patch) {
            var url = question.resource_uri,
                method = patch ? 'PATCH': 'PUT',
                data = question;
            if (! question.label) {
                question.label = question.title;
            }
            if (! url) {
                url = '/api/v1/question/';
                method = 'POST';
            }
            $scope.stopWatchingQuestions = true;

            // set empty strings to null
            _.each(question, function (value, key) {
                if (value === '') {
                    question[key] = null;
                }
            });

            data.grid_cols = _.map(question.grid_cols, function (grid_col) {
                return { pk: grid_col.id }
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
                        index = _.indexOf($scope.survey.questions, $scope.questionBeingEdited);
                        $scope.survey.questions[index] = result;
                        $scope.questionBeingEdited = result;
                        $scope.stopWatchingQuestions = false;    
                    }
                    
                } else if (status === 201) {                
                    $scope.activePage.questions.push(result);
                    $scope.questionBeingEdited = result;
                    $scope.savePage($scope.activePage, result);
                } else if (status === 200) {
                    angular.extend($scope.questionBeingEdited, result);
                }
                
                //$scope.startEditingQuestion($scope.questionBeingEdited);
                //$scope.questionBeingEdited = result;
                $scope.startEditingQuestion($scope.questionBeingEdited);
                $scope.activeQuestion.updated_at = new Date();
            });
        };
  });
