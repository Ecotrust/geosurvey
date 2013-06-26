//'use strict';

angular.module('askApp')
  .controller('AuthorCtrl', function ($scope, $http, $routeParams, $location) {
        $scope.survey = {};
        $scope.activeQuestion = null;
        $scope.questionBeingEdited = null;
        if ($routeParams.surveySlug) {    
            $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
                _.extend($scope.survey, data);
                
                
                if ($scope.survey.questions.length === 0) {
                    $scope.survey.questions = [];
                    $scope.newQuestion();
                }

                if ($location.search().question) {
                    $scope.startEditingQuestion(_.findWhere($scope.survey.questions, {slug: $location.search().question}))
                } else {
                    $scope.startEditingQuestion($scope.survey.questions[0]);
                }

            });

            $scope.$watch('survey.questions', function (newValue) {
                if (newValue) {
                    _.each($scope.survey.questions, function (question, index) {
                        if (question.order !== index) {
                            question.order = index;
                            question.update=true;
                        }
                    });
                }
            }, true);

        } else {
            $scope.newSurvey = true;
        }

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

        $scope.createSurvey = function (survey) {
            survey.slug = _.string.slugify(survey.name);
            $http.post('/api/v1/survey/', $scope.survey).success(function(data) {
                $location.path('/author/' + data.slug);
            });
        }

        $scope.startEditingQuestion = function (question) {
            $scope.activeQuestion = {};
            $scope.questionBeingEdited = question;
            angular.extend($scope.activeQuestion, question);
            $location.search({question:question.slug});
        };

        $scope.questionIsDirty = function(question) {
            return ! _.isEqual(question, $scope.questionBeingEdited);
        };

        $scope.saveQuestion = function (question) {
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

            $http({
                method: method,
                url: url,
                data: data
            }).success(function (result, status) {
                var index;
                if (status === 202) {
                    index = _.indexOf($scope.survey.questions, $scope.questionBeingEdited);
                    $scope.survey.questions[index] = result;
                    $scope.questionBeingEdited = result;
                } else if (status === 201) {
                    if (!$scope.survey.questions) {
                        $scope.survey.questions = [];
                    }
                    $scope.survey.questions.push(result.question);
                    $scope.questionBeingEdited = result.question;
                }
                
                $scope.startEditingQuestion($scope.questionBeingEdited);
                $scope.activeQuestion.updated_at = new Date();
            });
        };
  });
