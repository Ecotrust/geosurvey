/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

//'use strict';

(function() {

    var leafletDirective = angular.module('leaflet.directive', []);

    leafletDirective.directive('leaflet', function($http, $log, $compile, $timeout, $dialog, $routeParams) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                center: '=center',
                marker: '=marker',
                zoom: '=zoom',
                requiredzoom: '=requiredzoom',
                multiMarkers: '=multimarkers',
                multiMarkersEdit: '=multimarkersedit',
                popupField: '=popupfield',
                states: "=states",
                editMarker: '=editmarker',
                deleteMarker: '=deletemarker',
                isCrosshairAlerting: '=iscrosshairalerting',
                zoomToResult: '=zoomtoresult',
                activeMarkerKey: '=activeMarkerKey'
            },
            templateUrl: '/static/survey/views/leaflet.html',
            link: function(scope, element, attrs, ctrl) {
                var $el = element[0];

                // Layers init
                var bing = new L.BingLayer(map_api_key, { type: "AerialWithLabels" });
                var nautical = L.tileLayer.wms("http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
                    format: 'img/png',
                    transparent: true,
                    layers: null,
                    attribution: "NOAA Nautical Charts"
                });

                // Map init
                var initPoint = new L.LatLng(45, -122);
                var map = new L.Map($el, {
                    inertia: false
                })
                .addLayer(bing)
                .setView(initPoint, 5);
                map.attributionControl.setPrefix('');
                map.zoomControl.options.position = 'bottomleft';

                if (scope.multiMarkersEdit) {
                    // Layer picker init
                    var options = { position: 'bottomleft' };
                    L.control.layersToggle("View Satellite Imagery", bing, "View Nautical Charts", nautical, options).addTo(map);
                }

                // Study area boundary (if applicable)
                $http.get("/static/survey/data/boundaries/" + $routeParams.surveySlug + ".json").success(function(data) {
                    var boundaryStyle = {
                        "color": "#E6D845",
                        "weight": 3,
                        "opacity": 0.6,
                        "fillOpacity": 0.0,
                        "clickable": false
                    };
                    L.geoJson(data, { style: boundaryStyle })
                    .addTo(map)
                    .on('dblclick',
                        function(e) {
                            map.setZoom(map.getZoom() + 1);
                        });
                });

                scope.activeMarker = null;

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

                        scope.$watch('marker.icon', function(newValue) {
                            if (marker && marker._icon && marker._icon.src) {
                                marker._icon.src = '/static/survey/img/' + newValue;
                            }
                        });
                        scope.$watch('marker.visibility', function(newValue, oldValue) {
                            if (newValue) {
                                marker.setLatLng(new L.LatLng(scope.center.lat, scope.center.lng));
                                map.addLayer(marker);
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
                        if (newValue === 'ALL_MARKERS') {
                           scope.zoomToAllMarkers();
                        } else {
                            map.setZoom(newValue);
                        }
                    });


                });

                scope.zoomToAllMarkers = function () {
                    //$timeout(function () {
                        var lats = _.map(scope.multiMarkers, function (val) { return val.lat; }),
                            lngs = _.map(scope.multiMarkers, function (val) { return val.lng; }),

                            maxlat = Math.max.apply(Math, lats),
                            maxlng = Math.max.apply(Math, lngs),

                            minlat = Math.min.apply(Math, lats),
                            minlng = Math.min.apply(Math, lngs),

                            sw = new L.LatLng(minlat, minlng),
                            ne = new L.LatLng(maxlat, maxlng),

                            bounds = new L.LatLngBounds(sw, ne);

                        map.fitBounds(bounds.pad(0.2));
                    //}, 300);
                };

                scope.updateCrosshair = function() {
                    if (!scope.multiMarkersEdit) {
                        return;
                    }

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


                // scope.deleteMarker = function() {
                //     var i = _.indexOf(scope.multiMarkers, scope.activeMarker.data);
                //     scope.activeMarker.marker.closePopup();
                //     scope.multiMarkers.splice(i, 1);
                // };

                scope.isZoomedIn = function () {
                    return scope.zoom >= scope.requiredzoom;
                };

                scope.editMarkerWrapper = function(marker) {
                    marker.marker.closePopup();
                    scope.editMarker(marker.data);
                };

                scope.deleteMarkerWrapper = function(marker) {
                    marker.marker.closePopup();
                    scope.deleteMarker(marker.data);
                };


                if (attrs.multimarkers) {

                    var popup;
                    if (scope.popupField) {    
                        popup = '<h1 class="marker-popup-heading">Activities</h1>';
                        popup += '<ul class="unstyled marker-popup-list"><li ng-repeat="item in popupText"><i class="icon-ok-circle"></i>&nbsp;{{ item.text }}</li></ul>';
                    }
                    if (scope.multiMarkersEdit) {
                        popup += '<button class="btn pull-right" ng-click="editMarkerWrapper(activeMarker)"><i class="icon-edit"></i>&nbsp;Edit</button>';
                        popup += '<button class="btn btn-danger pull-right" ng-click="deleteMarkerWrapper(activeMarker)"><i class="icon-trash"></i>&nbsp;Remove</button>';
                        popup += '<div class="clearfix"></div>';
                    }

                    scope.showMarkerPopup = function (marker, templateData) {
                        scope.activeMarker = {
                            data: templateData,
                            marker: marker
                        };
                        scope.popupText = templateData[scope.popupField];
                        marker.openPopup();
                        $compile(angular.element(map._popup._contentNode))(scope);
                    };

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
                                        title: 'click for details',
                                        icon: L.AwesomeMarkers.icon({
                                            icon: 'icon-circle',
                                            color: color
                                        })
                                    });
                                    markDat.color = color;
                                    marker.closePopup();

                                    scope.$watch('multiMarkers.' + mkey, function() {
                                        if (scope.multiMarkers[mkey]) {
                                            marker.setLatLng(scope.multiMarkers[mkey]);
                                        } else {
                                            map.removeLayer(marker);
                                        }

                                    }, true);
                                    
                                    marker.bindPopup(popup, { closeButton: true });
                                    marker.on('click', function(e) {
                                        scope.showMarkerPopup(marker, scope.multiMarkers[mkey]);
                                        scope.$digest();
                                    });

                                    map.addLayer(marker);
                                    markersDict[mkey] = marker;
                                }
                                
                            })(mkey);
                        } // for mkey in multiMarkers
                    }); // watch multiMarkers


                    scope.$watch('activeMarkerKey', function (activeKey) {
                        // For situations where a component outside of the map can 
                        // change which marker is active.
                        if (scope.multiMarkers.hasOwnProperty(activeKey)) {
                            var markerData = scope.multiMarkers[activeKey];
                            var marker = markersDict[activeKey];
                            scope.showMarkerPopup(marker, markerData);
                        }
                    });

                } // if attrs.multiMarkers
            } // end of link function
        };
    });

}());
