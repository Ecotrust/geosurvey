'use strict';

angular.module('askApp')
    .controller('RespondantDetailCtrl', function($scope, $routeParams, $http) {

    $http.get('/api/v1/respondant/' + $routeParams.uuidSlug + '/?format=json').success(function(data) {
        $scope.response = data;
        if ($scope.getResponseBySlug('activity-locations')) {
            $scope.mapResponse = JSON.parse($scope.getResponseBySlug('activity-locations').answer);
        }
        

    });

    $scope.map = {
        center: {
            lat: 47,
            lng: -124
        },
        zoom: 7
    }

    $scope.getResponseBySlug = function(slug) {
        var question = _.filter($scope.response.responses, function(item) {
            return item.question.slug === slug;
        });

        return _.first(question);
    }
});