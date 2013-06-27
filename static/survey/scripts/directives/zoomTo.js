//'use strict';


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
        $scope.onResize();
    };

    $scope.onResize = function () {
        $timeout(function () {
            // Set modal body height to allow scrolling.
            var m = jQuery('.modal').height(),
                h = jQuery('.modal-header:visible').outerHeight(),
                f = jQuery('.modal-footer:visible').outerHeight(),
                b = jQuery(window).width() < 601 ? m - h - f : 'auto';
            jQuery('.modal-body').height(b);
            jQuery('.modal-body').css('margin-bottom', f+'px');
        }, 0);
    };
    $timeout(function () {
        jQuery(window).resize($scope.onResize);
    }, 0);
    $scope.onResize();

    $timeout(function () {
        document.getElementById("search-query").focus();
    }, 20);

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

    $scope.setZoomToPlace = function (place) {
        $scope.selectedPlace = place;
    };

    $scope.close = function() {
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
        template: '<div><div class="control-group large-screen"><i class="icon-search icon-large"></i><input type="text" id="search-query-facade" placeholder="Search" ng-click="openModal()"></div><a class="btn btn-large btn-search small-screen" ng-click="openModal()"><i class="icon-search icon-large"></i></a></div>',
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
                    keyboard: false,
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
