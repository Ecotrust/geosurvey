'use strict';

angular.module('askApp')
  .controller('AuthorCtrl', function ($scope, $http, $routeParams) {
        $http.get('/api/v1/survey/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
            $scope.survey = data;
        });
  });
