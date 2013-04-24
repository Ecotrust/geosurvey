/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

(function() {

    var leafletDirective = angular.module("leaflet-directive", []);

    leafletDirective.directive("leaflet", function($http, $log, $compile) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                center: "=center",
                marker: "=marker",
                message: "=message",
                zoom: "=zoom",
                multiMarkers: "=multimarkers",
                popupField: "=popupfield",
                deletemarker: '&'
            },
            template: '<div class="map"></div>',
            link: function(scope, element, attrs, ctrl) {
                var $el = element[0],
                    map = new L.Map($el);

                L.tileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}", {
                    maxZoom: 13
                }).addTo(map);

                // var googleLayer = new L.Google('ROADMAP');
                // map.addLayer(googleLayer);
                // Default center of the map
                var point = new L.LatLng(40.094882122321145, -3.8232421874999996);
                map.setView(point, 5);

                scope.activeMarker = null;

                element.bind('$destroy', function() {
                    //$timeout.cancel(timeoutId);
                });
                

                if (attrs.marker) {
                    var crosshairIcon = L.icon({
                        iconUrl: '/static/survey/img/crosshair.png',
                        shadowUrl: false,

                        iconSize: [90, 90], // size of the icon
                        shadowSize: [50, 64], // size of the shadow
                        iconAnchor: [45, 45], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62], // the same for the shadow
                        popupAnchor: [0, -25] // point from which the popup should open relative to the iconAnchor
                    });
                    var marker = new L.marker([scope.center.lat, scope.center.lng], {
                        icon: crosshairIcon
                    });
                    var dragging_marker = false;

                    // Listen for marker drags
                    (function() {

                        marker.on("dragstart", function(e) {
                            dragging_marker = true;
                            map.closePopup();
                        });

                        marker.on("drag", function(e) {
                            scope.$apply(function(s) {
                                s.marker.lat = marker.getLatLng().lat;
                                s.marker.lng = marker.getLatLng().lng;
                            });
                        });

                        marker.on("dragend", function(e) {
                            marker.openPopup();
                            dragging_marker = false;
                        });

                        // map.on("click", function(e) {
                        //     marker.setLatLng(e.latlng);
                        //     marker.openPopup();
                        //     scope.$apply(function (s) {
                        //         s.marker.lat = marker.getLatLng().lat;
                        //         s.marker.lng = marker.getLatLng().lng;
                        //     });
                        // });

                        scope.$watch("marker.visibility", function(newValue, oldValue) {

                            if (newValue) {
                                // marker.draggable = true;

                                marker.setLatLng(new L.LatLng(scope.center.lat, scope.center.lng));

                                map.addLayer(marker);
                                // marker.dragging.enable();
                                //marker.bindPopup("<strong>" + scope.message + "</strong>",
                                //    { closeButton: false });
                                //marker.openPopup();

                            }


                        });

                        scope.$watch("marker.lng", function(newValue, oldValue) {
                            if (dragging_marker) return;
                            if (marker.lng) {
                                marker.setLatLng(new L.LatLng(marker.getLatLng().lng, newValue));
                            }

                        });

                        scope.$watch("marker.lat", function(newValue, oldValue) {
                            if (dragging_marker) return;
                            if (marker.lat) {
                                marker.setLatLng(new L.LatLng(marker.getLatLng().lat, newValue));
                            }
                        });

                    }());

                }

                scope.$watch("center", function(center) {
                    if (center === undefined) return;

                    // Center of the map
                    center = new L.LatLng(scope.center.lat, scope.center.lng);
                    var zoom = scope.zoom || 8;
                    map.setView(center, zoom);



                    if (attrs.markcenter || attrs.marker) {


                        // if (attrs.marker) {
                        //     scope.marker.lat = marker.getLatLng().lat;
                        //     scope.marker.lng = marker.getLatLng().lng;
                        // }

                        // scope.$watch("message", function(newValue) {
                        //     marker.bindPopup("<strong>" + newValue + "</strong>",
                        //         { closeButton: false });
                        //     marker.openPopup();
                        // });
                    }

                    // Listen for map drags
                    var dragging_map = false;
                    map.on("dragstart", function(e) {
                        dragging_map = true;
                    });

                    map.on("zoomend", function(e) {
                        scope.$apply(function(s) {
                            s.zoom = map.getZoom();
                            s.center.lat = map.getCenter().lat;
                            s.center.lng = map.getCenter().lng;
                            marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                            s.marker.lat = map.getCenter().lat;
                            s.marker.lng = map.getCenter().lng;
                        });
                    });


                    map.on("drag", function(e) {
                        scope.$apply(function(s) {
                            s.center.lat = map.getCenter().lat;
                            s.center.lng = map.getCenter().lng;
                            marker.setLatLng(new L.LatLng(map.getCenter().lat, map.getCenter().lng));
                            s.marker.lat = map.getCenter().lat;
                            s.marker.lng = map.getCenter().lng;
                        });
                    });

                    map.on("dragend", function(e) {
                        dragging_map = false;
                    });

                    scope.$watch("center.lng", function(newValue, oldValue) {
                        if (dragging_map) return;
                        map.setView(new L.LatLng(map.getCenter().lat, newValue), map.getZoom());
                    });

                    scope.$watch("center.lat", function(newValue, oldValue) {
                        if (dragging_map) return;
                        map.setView(new L.LatLng(newValue, map.getCenter().lng), map.getZoom());
                    });

                    // Listen for zoom
                    scope.$watch("zoom", function (newValue, oldValue) {
                        map.setZoom(newValue);
                    });

                    
                });

                scope.delete = function() {
                    var index = _.indexOf(scope.multiMarkers, scope.activeMarker.data);
                    scope.activeMarker.marker.closePopup();
                    scope.multiMarkers.splice(index, 1);
                    //scope.activeMarker = null;
                };

                if (attrs.multimarkers) {
                    var markers_dict = [];
                    scope.$watch("multiMarkers.length", function(newMarkerList) {
                        console.log(newMarkerList);
                        _.each(markers_dict, function (item) {
                            debugger;
                        })
                        for (var mkey in scope.multiMarkers) {
                            (function(mkey) {
                                var mark_dat = scope.multiMarkers[mkey];
                                var marker = new L.marker(
                                scope.multiMarkers[mkey], {
                                    draggable: mark_dat.draggable ? true : false
                                });

                                marker.closePopup();
                                marker.on("dragstart", function(e) {
                                    dragging_marker = true;
                                });

                                marker.on("drag", function(e) {
                                    scope.$apply(function(s) {
                                        mark_dat.lat = marker.getLatLng().lat;
                                        mark_dat.lng = marker.getLatLng().lng;
                                    });
                                });

                                marker.on("dragend", function(e) {
                                    dragging_marker = false;
                                });

                                scope.$watch('multiMarkers.' + mkey, function() {
                                    if (scope.multiMarkers[mkey]) {
                                        marker.setLatLng(scope.multiMarkers[mkey]);
                                    } else {
                                        map.removeLayer(marker);
                                    }

                                }, true);

                                marker.on('click', function (e) {
                                    var popup = scope.multiMarkers[mkey][scope.popupField];
                                    if (popup) {
                                        popup += "<div>";
                                        popup += "<button class='btn pull-right'>edit</button>";
                                        popup += "<button class='btn btn-danger pull-right' ng-click='delete()'>delete</button>";
                                        popup += "</div>";
                                        popup += "<div class='clearfix'></div>";

                                        scope.popupMessage = scope.multiMarkers[mkey][scope.popupField];
                                        markers_dict[mkey].bindPopup(popup, {
                                            closeButton: true
                                        });

                                        markers_dict[mkey].openPopup();
                                         
                                        scope.activeMarker = {
                                            data: scope.multiMarkers[mkey],
                                            marker: marker
                                        };
                                        $compile(angular.element(map._popup._contentNode))(scope);
                                        $compile(angular.element(map._popup._contentNode.childNodes))(scope);    
                                    }
                                    
                                });

                                // scope.$watch('multiMarkers.' + mkey + '.answer', function(newValue) {
                                    
                                //     var popup = "<ul><li ng-repeat='messageLine in message'>{{messageLine}}</li></ul><br/><br/>";
                                //     popup += "<div>";
                                //     popup += "<button class='btn pull-right'>edit</button>";
                                //     popup += "<button class='btn btn-danger pull-right' ng-click='delete()'>delete</button>";
                                //     popup += "</div>";
                                //     popup += "<div class='clearfix'></div>";
                                //     if (newValue) {
                                //         scope.message = newValue;
                                //         markers_dict[mkey].bindPopup(popup, {
                                //             closeButton: true
                                //         });
                                //          markers_dict[mkey].openPopup();
                                //         $compile(angular.element(map._popup._contentNode))(scope);
                                //         scope.activeMarker = scope.multiMarkers[mkey];
                                //     }
                                // }, true);

                                map.addLayer(marker);
                                markers_dict[mkey] = marker;
                            })(mkey);
                        } // for mkey in multiMarkers
                    }); // watch multiMarkers
                } // if attrs.multiMarkers
            } // end of link function
        };
    });

}());