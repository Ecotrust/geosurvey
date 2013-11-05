angular.module('askApp')
    .directive('mobileMap', function($http) {
        return {
            template: '<div></div>',
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
            },

            link: function postLink(scope, element, attrs) {
                var $el = element[0], map = L.map($el, null, {});
                var layer = L.tileLayer('http://tilestream.apps.ecotrust.org/v2/deck/{z}/{x}/{y}.png');

                // layer.getTileUrl = function(tilePoint){
                //     var subdomains = this.options.subdomains,
                //         s = this.options.subdomains[(tilePoint.x + tilePoint.y) % subdomains.length],
                //         zoom = this._getZoomForUrl();
                    
                //     return_url = this._url
                //         .replace('{s}', s)
                //         .replace('{z}', zoom)
                //         .replace('{x}', tilePoint.x)
                //         .replace('{y}', Math.pow(2,zoom) - tilePoint.y -1);
                //     //console.debug("url = " + return_url + " & x, y, z = " + tilePoint.x+","+tilePoint.y+","+zoom)
                //     return return_url;
                // };

                map.addLayer(layer);
                map.setView([18.35, -64.85], 7);
                window.map = map;
            }
        }
    });