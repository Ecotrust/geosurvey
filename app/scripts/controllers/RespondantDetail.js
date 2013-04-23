'use strict';

angular.module('askApp')
  .controller('RespondantDetailCtrl', function ($scope, $routeParams, $http) {

    $http.get('/api/v1/respondant/' + $routeParams.uuidSlug + '/?format=json').success(function(data) {
        $scope.response = data;

        $scope.mapResponse = JSON.parse($scope.getResponseBySlug('activity-locations').answer);

    });

    $scope.map = {
        center: {
            lat: 38.75,
            lng: -72.59
        },
        zoom: 6
    }

    $scope.getResponseBySlug = function (slug) {
        var question = _.filter($scope.response.responses, function (item) {
            return item.question.slug === slug;
        });

        return _.first(question);
    }
  });
