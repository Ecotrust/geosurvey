'use strict';

angular.module('askApp')
  .controller('RespondantDetailCtrl', function ($scope, $routeParams, $http) {

    $http.get('/api/v1/respondant/?format=json').success(function(data) {

    });

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
