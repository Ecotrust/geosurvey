
angular.module('askApp')
    .controller('SummaryCtrl', function($scope, $http, $routeParams) {
    	var url = app.server + '/reports/distribution/catch-report/weight-*';

    	$http.get(url)
    		.success(function (data) {
    			$scope.summary = data.results.length ? data.results : 'none';
    			$scope.max = _.max($scope.summary, function (item) {
    				return item.total 
    			}).total;
    		})
    		.error(function (err) {
    			debugger;
    		});
    });