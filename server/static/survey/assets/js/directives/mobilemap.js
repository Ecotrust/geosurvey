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
                map.addLayer(L.tileLayer('http://tilestream.apps.ecotrust.org/v2/deck/{z}/{x}/{y}.png'));
                map.setView([45,-122], 9);

            }
        }
    });