
angular.module('askApp')
  .factory('logger', function ($http, $routeParams, $log) {
    

    // Public API here
    return {
      logUsage: function (usageSlug, data) {
        var questionSlug = 'non-question';
        if ($routeParams.questionSlug) {
            questionSlug = $routeParams.questionSlug;
        }

        url = ['/log/usage', $routeParams.surveySlug, questionSlug, usageSlug, $routeParams.uuidSlug].join('/');
        
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
