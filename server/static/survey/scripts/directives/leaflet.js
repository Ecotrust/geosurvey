/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

'use strict';

function ZoomAlertCtrl($scope, dialog, $location) {
    $scope.loaded = false;
    $scope.$watch(function() {
        return $location.path();
    }, function () {
        if ($scope.loaded && dialog.isOpen()) {
            $scope.close();
        }
        $scope.loaded = true;
    });

    $scope.close = function(result) {
        dialog.close(result);
    };
}

(function() {

    var leafletDirective = angular.module('leaflet.directive', []);

    leafletDirective.directive('leaflet', function($http, $log, $compile, $timeout, $dialog) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                center: '=center',
                marker: '=marker',
                message: '=message',
                zoom: '=zoom',
                requiredzoom: '=requiredzoom',
                multiMarkers: '=multimarkers',
                multiMarkersEdit: '=multimarkersedit',
                //popupField: '=popupfield',
                states: "=states",
                editMarker: '=editmarker',
                addMarker: '=addmarker',
                confirmingLocation: '=conflocation',
                zoomToResult: '=zoomtoresult'
            },
            templateUrl: '/static/survey/views/leaflet.html',
            link: function(scope, element, attrs, ctrl) {
                var $el = element[0];

                // Map initialization.
                var nautical = L.tileLayer.wms("http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
                    format: 'img/png',
                    transparent: true,
                    layers: null,
                    attribution: "NOAA Nautical Charts"
                });

                var ggl = new L.Google();

                var map = new L.Map($el, {
                    fadeAnimation: false,
                    zoomAnimation: false,
                    markerZoomAnimation: false,
                    inertia: false,
                    layers: [ggl],
                    attributionControl: false
                });
                map.attributionControl = false;
            
                var baseMaps = {
                    "Google": ggl,
                    "Nautical Charts": nautical
                };
                var options = {
                    position: 'topleft'
                };
                L.control.layers(baseMaps, null, options).addTo(map);

                var point = new L.LatLng(45, -122);
                map.setView(point, 5);

                scope.activeMarker = null;

                element.bind('$destroy', function() {
                    //$timeout.cancel(timeoutId);
                });

                scope.$watch('zoomToResult', function (place) {
                    if (place) {
                        scope.zoomTo(place); 
                        scope.zoomToResult = undefined;
                    }
                });

                scope.zoomTo = function(location) {
                    $timeout(function () {
                        map.setView({
                            lat: location.lat,
                            lng: location.lng
                        }, location.zoom || 15);
                        if (marker) {
                            marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                        }
                    });
                };


                if (attrs.marker) {
                    var crosshairIcon = L.icon({
                        iconUrl: '/static/survey/img/' + scope.marker.icon,
                        shadowUrl: false,

                        iconSize: [50, 50], // size of the icon
                        shadowSize: [50, 50], // size of the shadow
                        iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 4], // the same for the shadow
                        popupAnchor: [0, -25] // point from which the popup should open relative to the iconAnchor
                    });
                    var marker = new L.marker([scope.center.lat, scope.center.lng], {
                        icon: crosshairIcon
                    });
                    var draggingMarker = false;



                    // Listen for marker drags
                    (function() {

                        marker.on('dblclick', function(e) {
                            map.setZoom(map.getZoom() + 1);
                        });
                        marker.on('dragstart', function(e) {
                            draggingMarker = true;
                            map.closePopup();
                        });

                        marker.on('drag', function(e) {
                            scope.$apply(function(s) {
                                s.marker.lat = marker.getLatLng().lat;
                                s.marker.lng = marker.getLatLng().lng;
                            });
                        });

                        marker.on('dragend', function(e) {
                            marker.openPopup();
                            draggingMarker = false;
                        });

                        // map.on('click', function(e) {
                        //     marker.setLatLng(e.latlng);
                        //     marker.openPopup();
                        //     scope.$apply(function (s) {
                        //         s.marker.lat = marker.getLatLng().lat;
                        //         s.marker.lng = marker.getLatLng().lng;
                        //     });
                        // });


                        scope.$watch('marker.icon', function(newValue) {
                            if (marker && marker._icon && marker._icon.src) {
                                marker._icon.src = '/static/survey/img/' + newValue;
                            }
                            
                        });
                        scope.$watch('marker.visibility', function(newValue, oldValue) {

                            if (newValue) {
                                // marker.draggable = true;

                                marker.setLatLng(new L.LatLng(scope.center.lat, scope.center.lng));

                                map.addLayer(marker);
                                // marker.dragging.enable();
                                //marker.bindPopup('<strong>' + scope.message + '</strong>',
                                //    { closeButton: false });
                                //marker.openPopup();

                            }
                        });

                        scope.$watch('marker.lng', function(newValue, oldValue) {
                            if (draggingMarker) {
                                return;
                            }

                            if (marker.lng) {
                                marker.setLatLng(new L.LatLng(marker.getLatLng().lng, newValue));
                            }

                        });

                        scope.$watch('marker.lat', function(newValue, oldValue) {
                            if (draggingMarker) {
                                return;
                            }
                            if (marker.lat) {
                                marker.setLatLng(new L.LatLng(marker.getLatLng().lat, newValue));
                            }
                        });

                    }());

                }

                scope.$watch('center', function(center) {
                    if (center === undefined) {
                        return;
                    }

                    // Center of the map
                    center = new L.LatLng(scope.center.lat, scope.center.lng);
                    var zoom = scope.zoom || 8;
                    map.setView(center, zoom);



                    if (attrs.markcenter || attrs.marker) {


                        // if (attrs.marker) {
                        //     scope.marker.lat = marker.getLatLng().lat;
                        //     scope.marker.lng = marker.getLatLng().lng;
                        // }

                        // scope.$watch('message', function(newValue) {
                        //     marker.bindPopup('<strong>' + newValue + '</strong>',
                        //         { closeButton: false });
                        //     marker.openPopup();
                        // });
                    }

                    // Listen for map drags
                    var draggingMap = false;
                    map.on('dragstart', function(e) {
                        draggingMap = true;
                    });

                    map.on('zoomend', function(e) {
                        scope.$apply(function(s) {
                            s.zoom = map.getZoom();
                            s.center.lat = map.getCenter().lat;
                            s.center.lng = map.getCenter().lng;

                            if (marker) {
                                s.marker.lat = map.getCenter().lat;
                                s.marker.lng = map.getCenter().lng;
                                marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                            }

                            s.updateCrosshair();
                        });
                    });


                    map.on('drag', function(e) {
                        scope.$apply(function(s) {
                            s.center.lat = map.getCenter().lat;
                            s.center.lng = map.getCenter().lng;

                            if (marker) {
                                s.marker.lat = map.getCenter().lat;
                                s.marker.lng = map.getCenter().lng;
                                marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                            }
                        });
                    });

                    map.on('dragend', function(e) {
                        draggingMap = false;
                    });

                    scope.$watch('center.lng', function(newValue, oldValue) {
                        if (draggingMap) {
                            return;
                        }

                        map.setView(new L.LatLng(map.getCenter().lat, newValue), map.getZoom());
                        if (marker) {
                            marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                        }


                    });

                    scope.$watch('center.lat', function(newValue, oldValue) {
                        if (draggingMap) {
                            return;
                        }
                        map.setView(new L.LatLng(newValue, map.getCenter().lng), map.getZoom());

                        if (marker) {
                            marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                        }

                    });

                    // Listen for zoom
                    scope.$watch('zoom', function(newValue, oldValue) {
                        map.setZoom(newValue);
                    });


                });

                scope.$watch('confirmingLocation', function () {
                    scope.updateCrosshair();
                });

                scope.updateCrosshair = function() {
                    if (scope.confirmingLocation) {
                        scope.marker.icon = "crosshair_blank.png";

                    } else if (scope.isCrosshairAlerting && !scope.isZoomedIn()) {
                        scope.marker.icon = "crosshair_red.png";

                    } else if (scope.isCrosshairAlerting && scope.isZoomedIn()) {
                        scope.marker.icon = "crosshair_green.png";

                    } else {
                        scope.marker.icon = "crosshair_white.png";
                    }
                };


                scope.deleteMarker = function() {
                    var i = _.indexOf(scope.multiMarkers, scope.activeMarker.data);
                    scope.activeMarker.marker.closePopup();
                    scope.multiMarkers.splice(i, 1);
                };

                scope.isZoomedIn = function () {
                    return scope.zoom >= scope.requiredzoom;
                };

                scope.isCrosshairAlerting = false;

                scope.showZoomAlert = function () {
                    var d = $dialog.dialog({
                        backdrop: true,
                        keyboard: true,
                        backdropClick: false,
                        backdropFade: true,
                        transitionClass: 'fade',
                        templateUrl: '/static/survey/views/zoomAlertModal.html',
                        controller: 'ZoomAlertCtrl'
                    });
                    d.open();
                }


                scope.addMarkerWrapper = function() {
                    if (scope.activeMarker) {
                        scope.activeMarker.marker.closePopup();
                    }
                    if (!scope.isZoomedIn()) {
                        scope.isCrosshairAlerting = true;
                        scope.showZoomAlert();
                    } else {
                        scope.addMarker(scope.getNextColor());
                        scope.isCrosshairAlerting = false;
                    }
                    scope.updateCrosshair();
                };

                scope.editMarkerWrapper = function(marker) {
                    marker.marker.closePopup();
                    scope.editMarker(marker.data);
                };

                scope.getNextColor = function () {
                    var availableColors = [],
                        colorPalette = [
                        'red',
                        'orange',
                        'green',
                        'darkgreen',
                        'darkred',
                        'blue',
                        'darkblue',
                        'purple',
                        'darkpurple',
                        'cadetblue'
                    ];

                    availableColors = angular.copy(colorPalette);
                    _.each(scope.multiMarkers, function (marker) {
                        if (_.has(marker, 'color')) {
                            availableColors = _.without(availableColors, marker.color);
                        }
                        if (availableColors.length == 0) {
                            // Recyle the colors if we run out.
                            availableColors = angular.copy(colorPalette);
                        }                        
                    });
                    return _.first(availableColors);
                };

                if (attrs.multimarkers) {
                    var markersDict = [];
                    scope.$watch('multiMarkers.length', function(newMarkerList) {
  
                        for (var mkey in scope.multiMarkers) {
                            (function(mkey) {
                                var markDat = scope.multiMarkers[mkey];
                                if (markDat.lat && markDat.lat) {

                                    var color = markDat.color;
                                    var marker = new L.marker(
                                    scope.multiMarkers[mkey], {
                                        draggable: markDat.draggable ? true : false,
                                        icon: L.AwesomeMarkers.icon({
                                            icon: 'icon-circle',
                                            color: color
                                        })
                                    });
                                    markDat.color = color;    
                                    marker.closePopup();
                                    marker.on('dragstart', function(e) {
                                        draggingMarker = true;
                                    });

                                    marker.on('drag', function(e) {
                                        scope.$apply(function(s) {
                                            markDat.lat = marker.getLatLng().lat;
                                            markDat.lng = marker.getLatLng().lng;
                                        });
                                    });

                                    marker.on('dragend', function(e) {
                                        draggingMarker = false;
                                    });

                                    scope.$watch('multiMarkers.' + mkey, function() {
                                        if (scope.multiMarkers[mkey]) {
                                            marker.setLatLng(scope.multiMarkers[mkey]);
                                        } else {
                                            map.removeLayer(marker);
                                        }

                                    }, true);
                                    
                                    map.addLayer(marker);
                                    markersDict[mkey] = marker;    
                                }
                                
                            })(mkey);
                        } // for mkey in multiMarkers
                    }); // watch multiMarkers
                } // if attrs.multiMarkers
            } // end of link function
        };
    });

}());