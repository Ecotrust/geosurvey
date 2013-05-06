'use strict';

angular.module('askApp')
  .controller('AuthorCtrl', function ($scope, $http, $routeParams) {
        $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
            $scope.survey = data;
            $scope.startEditingQuestion($scope.survey.questions[0]);
        });

        $scope.activeQuestion = null;
        $scope.questionBeingEdited = null;

        $scope.startEditingQuestion = function (question) {
            
            $scope.activeQuestion = {};
            $scope.questionBeingEdited = question;
            angular.extend($scope.activeQuestion, question);
        };

        $scope.questionIsDirty = function(question) {
            return ! _.isEqual(question, $scope.questionBeingEdited);
        }

        $scope.saveQuestion = function (question) {
            $http({
                method: 'PUT',
                url: question.resource_uri,
                data: question
            }).success(function (result, status) {
                var index;
                if (status === 202) {
                    index = _.indexOf($scope.survey.questions, $scope.questionBeingEdited);
                    $scope.survey.questions[index] = result;
                    $scope.activeQuestion.updated_at = new Date();

                }
            });
        };
  });
