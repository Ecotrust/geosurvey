'use strict';


function ZoomToCtrl($scope, dialog, $http, $timeout) {
    var stop;

    $scope.results = [];
    $scope.showSpinner = false;

    if ($scope.states) {
        $scope.stateParam = '&state__in=' + $scope.states.split(',').join('&state__in=')
    }

    $scope.$watch('searchTerm', function (newValue) {    
        if (stop) {
            $timeout.cancel(stop);
        }
        if (newValue && newValue.length > 2) {
            $scope.showSpinner = true;
            stop = $timeout(function() {
                var url = '/api/v1/place/?format=json&limit=30';
                if ($scope.states) {
                    url = url + '&state__in=' + $scope.states;
                }
                console.log(url);
                $http.get(url  + '&name__icontains='+ $scope.searchTerm).success(function(data) {
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
        template: '<span><input type="text" placeholder="Search locations" ng-click="openModal()"> <button class="btn btn-large" ng-click="openModal()"><i class="icon-search"></i></button></span>',
        restrict: 'EA',
        replace: true,
        link: function postLink(scope, element, attrs) {
            scope.openModal = function () {
                var dialog = $dialog.dialog({
                    backdrop: true,
                    backdropFade: true,
                    transitionClass: 'fade',
                    keyboard: true,
                    backdropClick: false,
                    scope: {
                        states: scope.states
                    },
                    templateUrl: '/static/survey/views/zoomToModal.html',
                    controller: 'ZoomToCtrl'
                });
                dialog.open().then(function (place) {
                    if (place) {
                        scope.zoomTo({
                            lat: place.lat,
                            lng: place.lng,
                            zoom: 15

                        });    
                    }
                    
                });
            };

            scope.$eval(attrs.onload);
        }
    };
});