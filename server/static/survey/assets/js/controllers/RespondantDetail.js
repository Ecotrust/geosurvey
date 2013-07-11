//'use strict';

angular.module('askApp')
    .controller('RespondantDetailCtrl', function($scope, $routeParams, $http) {

    $http.get('/api/v1/reportrespondant/'  + $routeParams.uuidSlug + '/?format=json&survey__slug=' + $routeParams.surveySlug).success(function(data) {
        _.each(data.responses, function (response) {

            response.answer_parsed = JSON.parse(response.answer_raw);
        })
        $scope.respondent = data;
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
