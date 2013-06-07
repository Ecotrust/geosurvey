'use strict';

angular.module('mobileApp')
  .factory('server', ['Restangular'], function (Restangular) {
    // Service logic
    // ...
    var surveys = Restangular.all('surveys').getList();

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
