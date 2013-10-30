
angular.module('askApp')
  .controller('SplashCtrl', function ($scope, $location, $http) {
  	$('.splash').height($('body').height()).backstretch('assets/img/splash.png');
  });