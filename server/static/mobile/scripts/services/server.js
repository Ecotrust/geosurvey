'use strict';

angular.module('serverService', ['restangular'])
  .factory('server', function(Restangular) {

  var surveys = Restangular.all('survey').getList();

  var survey;

  return {
    getSurveys: function() {
      return surveys;
    },
    getSurvey: function(survey) {
      survey = Restangular.one('survey', survey).get();
      return survey;
    },
    getQuestionBySlug: function (question) {
      debugger;
    }
  };
});