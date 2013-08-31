
angular.module('askApp')
    .directive('rangeslider', function() {

    return {
        template: '<div class="range-slider"></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            start: "=start",
            end: "=end"
        },
        link: function (scope, element, attrs) {
            
            // initialize slider
            element.dateRangeSlider({
                bounds:{
                    min: scope.start,
                    max: scope.end
                },
                set: {
                    days: 1
                }
            });

            // set default values
            if (attrs.start) {
                scope.$watch('start', function (newStart) {
                    element.dateRangeSlider("max", newStart);
                })
            }
            if (attrs.end) {
                scope.$watch('end', function (newEnd) {
                    element.dateRangeSlider("max", newEnd);  
                });
                
            }

            // bind change event
            element.bind("userValuesChanged", function(e, data){
                scope.$apply(function(s) {
                    if (attrs.start) {
                        s.start = data.values.min.clearTime();
                    }
                    if (attrs.end) {                    
                        s.end = data.values.max.clearTime();
                    }
                });
            });
        }
    }
});