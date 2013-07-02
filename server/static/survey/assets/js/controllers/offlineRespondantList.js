//'use strict';

angular.module('askApp')
    .controller('offlineRespondantListCtrl', function($scope, $http, $routeParams, $location) {

        $scope.respondents = _.toArray(app.respondents);
        _.each($scope.respondents, function (respondent) {
            respondent.ts = respondent.uuid.split(':')[1];
        });
});