
angular.module('askApp')
    .directive('dashMap', function() {

    return {
        template: '<div class="map"></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            
        },
        link: function (scope, element, attrs) {
            var $el = element[0];
            var map = L.map($el).setView([17.7397, -64.7389], 7);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    }
});