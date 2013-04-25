'use strict';


function ZoomToCtrl($scope, dialog, $http, $timeout) {
    var stop;

    $scope.results = [];
    $scope.showSpinner = false;

    $scope.$watch('searchTerm', function (newValue) {
        
        if (stop) {
            $timeout.cancel(stop);
        }

        if (newValue && newValue.length > 2) {
            $scope.showSpinner = true;
            stop = $timeout(function() {
                $http.get('/api/v1/place/?format=json&limit=30&name__icontains=' + $scope.searchTerm).success(function(data) {
                    $scope.results = data.objects;
                    $scope.meta = data.meta;
                    $scope.showSpinner = false;
                });
            }, 1000);
        } else {
            $scope.results = [];
            $scope.showSpinner = false;
        }
    });

    $scope.zoomTo = function (place) {            
        dialog.close(place);
    };

    $scope.close = function(result) {
        dialog.close(result);
    };
}

angular.module('askApp')
    .directive('zoomto', function($dialog) {


    return {
        template: '<button class="btn btn-zoom btn-large" ng-click="openModal()">Zoom To...</button>',
        restrict: 'E',
        replace: true,
        link: function postLink(scope, element, attrs) {
            scope.openModal = function () {
                var dialog = $dialog.dialog({
                    backdrop: true,
                    keyboard: true,
                    backdropClick: false,
                    templateUrl: '/static/survey/views/zoomToModal.html',
                    controller: 'ZoomToCtrl',
                });
                dialog.open().then(function (place) {
                    scope.zoomTo({
                        lat: place.lat,
                        lng: place.lng,
                        zoom: 10

                    });
                });
            };
        }
    };
});