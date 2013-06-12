/* adapted from https://github.com/tombatossals/angular-leaflet-directive */

'use strict';

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

                var nautical = L.tileLayer.wms("http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
                    format: 'img/png',
                    transparent: true,
                    layers: null,
                    attribution: "NOAA Nautical Charts"
                });


                var map = new L.Map($el, {
                    
                    layers: [nautical]
                });
            
                var baseMaps = {
                    "Nautical Charts": nautical
                };
                scope.selectedFilter = null;
                scope.$watch('question', function (question) {
                    var url = '/reports/geojson/marco/' + question.slug;
                    if (question) {
                        map.setView(new L.LatLng(question.lat, question.lng), question.zoom);
                        
                        if (question.selectedFilter !== scope.selectedFilter) {
                            if (question.selectedFilter) {
                                url = url  + '?filter=' + question.selectedFilter;
                            }
                            $http.get(url).success(function(data) {
                                var filterItems;
                                if (! scope.filterItems) {
                                    filterItems = _.map(data.geojson, function (location) { 
                                        return location.properties.label    
                                    });
                                    scope.filterItems = _.uniq(filterItems).sort();
                                }
                                
                                scope.geojson = data.geojson;
                                if (scope.points) {
                                    map.removeLayer(scope.points);
                                }
                                scope.points = L.geoJson(scope.geojson);
                                scope.points.addTo(map);
                             });
                             scope.selectedFilter = question.selectedFilter;
                             console.log('get points');    
                        }
                        
                    }
                }, true);
            } // end of link function
        };
    });

}());