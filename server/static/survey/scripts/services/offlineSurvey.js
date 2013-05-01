'use strict';

angular.module('askApp')
  .factory('offlineSurvey', function () {
    


    // Public API here
    return {
      answerQuestion: function (survey, question, answer) {
        var key = [survey.slug, question.slug].join(':');
        amplify.store(key, answer);
        return answer;
      }
    };
  });
