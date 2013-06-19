/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

'use strict';

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
                zoom: '=zoom',
                requiredzoom: '=requiredzoom',
                multiMarkers: '=multimarkers',
                multiMarkersEdit: '=multimarkersedit',
                popupField: '=popupfield',
                states: "=states",
                editMarker: '=editmarker',
                isCrosshairAlerting: '=iscrosshairalerting',
                zoomToResult: '=zoomtoresult'
            },
            templateUrl: '/static/survey/views/leaflet.html',
            link: function(scope, element, attrs, ctrl) {
                var $el = element[0];

                // Layer init
                var nautical = L.tileLayer.wms("http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
                    format: 'img/png',
                    transparent: true,
                    layers: null,
                    attribution: "NOAA Nautical Charts"
                });

                var ggl = new L.Google();

                // Map init
                var initPoint = new L.LatLng(45, -122);
                var map = new L.Map($el, {
                    fadeAnimation: false,
                    zoomAnimation: false,
                    markerZoomAnimation: false,
                    inertia: false,
                    attributionControl: false
                })
                .setView(initPoint, 5)
                .addLayer(ggl);

                map.attributionControl = false;
                map.zoomControl.options.position = 'bottomleft';
            
                // Layer picker init
                var baseMaps = {
                    "Google": ggl,
                    "Nautical Charts": nautical
                };
                var options = {
                    position: 'bottomleft'
                };
                L.control.layers(baseMaps, null, options).addTo(map);

                $http.get("/static/survey/data/marco_dd.json").success(function(data) {
                    var boundaryStyle = {
                        "color": "#E6D845",
                        "weight": 3,
                        "opacity": 0.6,
                        "fillOpacity": 0.0
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
                                // marker.bindPopup('<strong>' + scope.message + '</strong>',
                                //    { closeButton: false });
                                // marker.openPopup();

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

                scope.editMarkerWrapper = function(marker) {
                    marker.marker.closePopup();
                    scope.editMarker(marker.data);
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
                                    
                                    // marker.on('click', function(e) {
                                    //     var popup;

                                    //     if (scope.popupField) {
                                    //         scope.popupText = scope.multiMarkers[mkey][scope.popupField];
                                    //         popup = '<ul class="unstyled"><li ng-repeat="item in popupText">{{ item.text }}</li></ul>';
                                    //     }


                                    //     if (scope.multiMarkersEdit) {
                                    //         popup += '<button class="btn pull-right" ng-click="editMarkerWrapper(activeMarker)">edit</button>';
                                    //         popup += '<div class="clearfix"></div>';

                                    //     }

                                    //     markersDict[mkey].bindPopup(popup, {
                                    //         closeButton: true
                                    //     });

                                    //     markersDict[mkey].openPopup();

                                    //     //scope.activeMarker = scope.multiMarkers[mkey];

                                    //     scope.activeMarker = {
                                    //         data: scope.multiMarkers[mkey],
                                    //         marker: marker
                                    //     };

                                    //     $compile(angular.element(map._popup._contentNode))(scope);
                                    //     //$compile(angular.element(map._popup._contentNode.childNodes))(scope);
                                    //     scope.$digest();

                                    // });

                                    // scope.$watch('multiMarkers.' + mkey + '.answer', function(newValue) {

                                    //     var popup = '<ul><li ng-repeat='messageLine in message'>{{messageLine}}</li></ul><br/><br/>';
                                    //     popup += '<div>';
                                    //     popup += '<button class='btn pull-right'>edit</button>';
                                    //     popup += '<button class='btn btn-danger pull-right' ng-click='delete()'>delete</button>';
                                    //     popup += '</div>';
                                    //     popup += '<div class='clearfix'></div>';
                                    //     if (newValue) {
                                    //         scope.message = newValue;
                                    //         markersDict[mkey].bindPopup(popup, {
                                    //             closeButton: true
                                    //         });
                                    //          markersDict[mkey].openPopup();
                                    //         $compile(angular.element(map._popup._contentNode))(scope);
                                    //         scope.activeMarker = scope.multiMarkers[mkey];
                                    //     }
                                    // }, true);




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