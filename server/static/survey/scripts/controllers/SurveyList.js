'use strict';

angular.module('askApp')
  .controller('SurveyListCtrl', function ($scope, $http) {
  	$http.get('/api/v1/survey/?format=json').success(function(data) {
  	  $scope.surveys = data.objects;
      app.surveys = $scope.surveys;
      localStorage.setItem("surveys", JSON.stringify(app.surveys));
  	});
  });
