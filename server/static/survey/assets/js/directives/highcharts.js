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
            link: function(scope, element, attrs) {
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
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                                    click: function(e) {
                                        debugger;
                                        scope.$apply(function(s) {
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
                        var $element = $(chart.xAxis[0].ticks[tickPos].label.element);
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

angular.module('askApp')
    .directive('pieChart', function() {

        return {
            template: '<div class="pie-chart" style="min-width: 100%; height: 300px; margin: 0 auto"></div>',
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                chart: "=chart",
                filter: "=filter"
            },
            link: function(scope, element, attrs) {
                scope.$watch('filter', function (newValue) {
                    console.log(newValue);
                    element.highcharts({
                        chart: {
                            plotBackgroundColor: 'rgba(255, 255, 255, 0.1)',
                            plotBorderWidth: null,
                            plotShadow: false
                        },
                        title: {
                            text: false
                        },
                        tooltip: {
                            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    color: '#000000',
                                    connectorColor: '#000000',
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                }
                            }
                        },
                        series: [{
                            type: 'pie',
                            name: 'Browser share',
                            data: [
                                ['Hook and Line or Rod and Reel', 45.0],
                                ['Lobster Traps', 26.8],
                                ['Nets', 8.5],
                                ['Spear or By Hand', 6.2]
                            ]
                        }]
                    });    
                }, true);
                
            }
        }
    });