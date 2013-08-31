
angular.module('askApp')
    .directive('stackedBar', function() {

    return {
        template: '<div class="stacked-bar" style="min-width: 100%; height: 400px; margin: 0 auto"></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            chart: "=chart",
            filter: "=filter"
        },
        link: function (scope, element, attrs) {
            element.highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: scope.chart.title
                },
                xAxis: {
                    categories: scope.chart.categories
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    title: {
                        text: 'Percentage of ACL'
                    }
                },
                legend: {
                    backgroundColor:'rgba(255, 255, 255, 0.1)',
                    reversed: true
                },
                credits: {
                  enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        point: {
                            events: {
                                click: function (e) {
                                    debugger;
                                    scope.$apply(function (s) {
                                        s.filter.category = e.point.category;
                                        s.filter.name = e.point.series.name;    
                                    })
                                    

                                }
                            }
                        }
                              
                    }
                },
                series: scope.chart.series,

            }); 
            var chart = element.highcharts();
            
            var onXaxisRedraw = function() {
                for (var tickPos in chart.xAxis[0].ticks) {
                    var $element= $(chart.xAxis[0].ticks[tickPos].label.element);
                    $element.unbind('click');
                    $element.click(function() {
                        console.log($(this).text());
                    });
                }
            }
            onXaxisRedraw();
            chart.xAxis[0].redraw(onXaxisRedraw);
        }
    }
});


