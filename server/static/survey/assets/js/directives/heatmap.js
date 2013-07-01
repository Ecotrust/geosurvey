/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

//'use strict';

(function() {

    var leafletDirective = angular.module('heatmap.directive', []);

    leafletDirective.directive('heatmap', function($http) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                question: "=question",
                filterItems: "=filteritems"
            },
            templateUrl: '/static/survey/views/heatmap.html',
            link: function(scope, element, attrs, ctrl) {
                var $el = element[0],
                    cloudmadeUrl = 'http://{s}.tile.cloudmade.com/API-key/{styleId}/256/{z}/{x}/{y}.png',
                    cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';


                var bing = new L.BingLayer("Av8HukehDaAvlflJLwOefJIyuZsNEtjCOnUB_NtSTCwKYfxzEMrxlKfL1IN7kAJF", {
                    type: "AerialWithLabels"
                });
                var map = new L.Map($el, {

                    layers: [bing]
                });
                
                var baseMaps = {
                    "Bing": bing
                };

                var mapInitialized=false;
                scope.selectedFilter = null;
                scope.$watch('question', function(question) {
                    var url = '/reports/geojson/marco/' + question.slug, filter=[], filterJSON;
                    if (question) {
                        if (! mapInitialized) {
                            map.setView(new L.LatLng(question.lat, question.lng), question.zoom); 
                            mapInitialized = true;
                        }
                        
                        
                        _.each(question.filters, function (v, k) {
                            var thisFilter = {};
                            
                            if (v.length) {    
                                thisFilter[k] = v;
                                filter.push(thisFilter);
                            }
                        });
                        
                        filterJSON = JSON.stringify(filter);
                        if (filterJSON !== scope.filterJSON) {
                            if (filterJSON) {
                                url = url + '?filters=' + filterJSON;
                            }
                            $http.get(url).success(function(data) {
                                var filterItems, heatMapData=[];
                                if (scope.heatmapLayer) {
                                    map.removeLayer(scope.heatmapLayer);
                                }
                                scope.heatmapLayer = L.TileLayer.heatMap({
                                    // radius could be absolute or relative
                                    // absolute: radius in meters, relative: radius in pixels
                                    radius: { value: 10000, absolute: true },
                                    //radius: { value: 20, absolute: false },
                                    opacity: 0.8,
                                    legend: {
                                               position: 'br',
                                               title: 'Example Distribution'
                                           },   
                                    gradient: {
                                        0.45: "rgb(0,0,255)",
                                        0.55: "rgb(0,255,255)",
                                        0.65: "rgb(0,255,0)",
                                        0.95: "yellow",
                                        1.0: "rgb(255,0,0)"
                                    }
                                });
                                scope.heatmapLayer.addTo(map);
                                if (!scope.filterItems) {
                                    filterItems = _.map(data.geojson, function(location) {
                                        return location.properties.label
                                    });
                                    scope.filterItems = _.uniq(filterItems).sort();
                                }

                                scope.geojson = data.geojson;
                                
                                _.each(scope.geojson, function (feature) {
                                    var lat = feature.geometry.coordinates[1];
                                    var lon = feature.geometry.coordinates[0];
                                
                                    heatMapData.push({lat: lat, lon: lon, value: 1});
                                });
                                scope.heatmapLayer.setData(heatMapData);
                                
                            });

                            scope.filterJSON = filterJSON;
                        
                        }

                    }
                }, true);
            } // end of link function
        };
    });

}());
