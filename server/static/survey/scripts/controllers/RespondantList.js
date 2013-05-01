'use strict';

angular.module('askApp')
  .controller('RespondantListCtrl', function ($scope, $http) {
    $http.get('/api/v1/respondant/?format=json').success(function(data) {
      $scope.respondants = data.objects;
    });

  });
