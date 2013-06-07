'use strict';

angular.module('serverService', ['restangular'])
  .factory('server', function (Restangular) {
    // Service logic
    // ...
    var surveys = Restangular.all('survey').getList();

    
    

    // Public API here
    return {
      getSurveys: function () {
        return surveys;
      }
    };
  });

