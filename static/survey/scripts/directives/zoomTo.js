'use strict';


function ZoomToCtrl($scope, dialog, $http, $timeout, $location) {
    var stop;

    $scope.panes = {
        search: {},
        mapUsage: {}
    };    
    $scope.currentPane = null;
    $scope.show = function (paneName) {
        if (_.has($scope.panes, paneName)) {
            _.each($scope.panes, function (value, key, list) {
                $scope.panes[key].showing = false;
            });
            $scope.panes[paneName].showing = true;
            $scope.currentPane = $scope.panes[paneName];
        }
    };
    $scope.show('search');

    $scope.results = [];
    $scope.showSpinner = false;
    $scope.showNoResults = false;
    $scope.selectedPlace = null;

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
                $http.get(url  + '&name__icontains='+ $scope.searchTerm).success(function(data) {
                    $scope.results = data.objects;
                    $scope.meta = data.meta;
                    $scope.showSpinner = false;
                    $scope.showNoResults = $scope.results.length == 0 && $scope.searchTerm && $scope.searchTerm.length > 0;
                });
            }, 1000);
        } else {
            $scope.results = [];
            $scope.showSpinner = false;
            $scope.showNoResults = false
        }
    });

    $scope.zoomTo = function (place) {            
        $scope.selectedPlace = place;
    };

    $scope.close = function(result) {
        dialog.close($scope.selectedPlace);
    };

    // If user hits back button, close the modal.
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

}

angular.module('askApp')
    .directive('zoomto', function($dialog) {

    return {
        template: '<div class="control-group"><i class="icon-search icon-2x"></i><input type="text" id="search-query-facade" placeholder="Search" ng-click="openModal()"></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            states: "=states",
            zoomToResult: "=zoomtoresult",
            numLocations: "=numlocations"
        },
        link: function postLink(scope, element, attrs) {
            scope.isInitialView = true;
            scope.openModal = function () {
                var dialog = $dialog.dialog({
                    backdrop: true,
                    backdropFade: true,
                    transitionClass: 'fade',
                    keyboard: true,
                    backdropClick: false,
                    scope: {
                        states: scope.states,
                        isInitialView: scope.isInitialView,
                        numLocations: scope.numLocations
                    },
                    templateUrl: '/static/survey/views/zoomToModal.html',
                    controller: 'ZoomToCtrl'
                });
                dialog.open().then(function (place) {
                    scope.isInitialView = false;
                    if (place) {
                        scope.zoomToResult = {
                            lat: place.lat,
                            lng: place.lng,
                            zoom: 15
                        };
                    }
                });
            };

            scope.$eval(attrs.onload);
        }
    };
});