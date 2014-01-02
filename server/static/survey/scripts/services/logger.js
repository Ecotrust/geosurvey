
angular.module('askApp')
  .factory('logger', function ($http, $routeParams, $log) {
    

    // Public API here
    return {
      logUsage: function (usageSlug, data) {
        var survey = $routeParams.surveySlug || 'undefined-survey',
            question = $routeParams.questionSlug || 'undefined-question',
            uuid = $routeParams.uuidSlug || 'undefined-uuid';

        url = ['/log/usage', survey, question, usageSlug, uuid].join('/');
        
        $http({
            url: url,
            method: 'POST',
            data: {
                'data': data
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).error(function(data, status, headers, config) {
            $log.error('Failed to log usage to ' + url + '.');
        });

      }
    };
  });