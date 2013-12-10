
angular.module('askApp')
  .controller('SplashCtrl', function ($scope, $location, $http) {
  	$scope.version = app.version;
  	$scope.stage = app.stage;
  	// $('.splash').height($('body').height()).backstretch('assets/img/splash.png');
  });