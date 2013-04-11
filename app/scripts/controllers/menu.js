'use strict';

angular.module('askApp')
  .controller('MenuCtrl', function ($scope, $location) {

  	$scope.isActive = function (path) {
  		return path === $location.path();
  	} 

    $scope.menuItems = [
      { 
      	'name': 'Home',
      	'path': '/'
      },
      { 
        'name': 'Surveys',
        'path': '/surveys'
      }
     
    ];
  });
