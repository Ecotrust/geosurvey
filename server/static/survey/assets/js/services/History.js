//'use strict';

angular.module('askApp')
  .factory('history', function ($http, $location) {
    // Service logic
    // ...

    // var survey, 
    //     page,
    //     answers;

    // var initializeSurvey = function(thisSurvey, thisPage, thisAnswers) {
    //     survey = thisSurvey;
    //     page = thisPage;
    //     answers = thisAnswers;
    // };

    var getSurveyTitle = function(respondent) {
        var title = respondent.survey;
        title += respondent.ts;
        return title;
    }

    var getTitle = function(respondent) {
        try {
            var island = _.findWhere(respondent.responses, {question: 'island'}).answer.text,
                title = 'USVI Commercial Catch Report Form - ' + island;  
        } catch(e) {
            var title = 'USVI Commercial Catch Report Form';
        }
        return title;
    };

    var gearTypeIncludes = function(type, respondent) {
        try { 
            var gearTypes = _.pluck(_.findWhere(respondent.responses, {question: 'gear-type'}).answer, 'label');

            if ( gearTypes.join().indexOf(type) !== -1 ) {
                return true;
            } 
        } catch(e) {
            return '';
        }
    };

    var trapTypeIncludes = function(type, respondent) {
        try { 
            var gearTypes = _.pluck(_.findWhere(respondent.responses, {question: 'gear-type'}).answer, 'label');  
            if ( gearTypes.join().indexOf(type) !== -1 ) {
                return true;
            } 
        } catch(e) {
            return '';
        }
    };

    var getAnswer = function(questionSlug, respondent) {
        try {
            if (questionSlug === 'weight-line-or-reel' || questionSlug === 'weight-traps' || questionSlug === 'weight-nets' || questionSlug === 'weight-spear-or-by-hand') {
                var island = _.findWhere(respondent.responses, {question: 'island'}).answer.label,
                    islandSlug = (island === 'st-thomas' || island === 'st-john') ? 'st-thomas-st-john' : island,
                    answer = _.findWhere(respondent.responses, {question: questionSlug + '-' + islandSlug}).answer;

                // TODO: currently no way of determining definitively whether answers are from a grouped multi-select or an ungrouped multi-select
                // (no groupName may present because either just Others were selected, or no groups were present)
                // seems like solution would be to ensure selections that were grouped under Other heading should be marked as such...                    
                _.each(answer, function(obj, index) {
                    if (index === 0 && obj.groupName) {
                        obj.showGroupName = obj.groupName;
                    } else if (obj.groupName && obj.groupName !== answer[index-1].groupName) {
                        obj.showGroupName = obj.groupName;
                    } else if (obj.other && answer[index-1].showGroupName !== 'Other') {
                        obj.showGroupName = 'Other';
                    } else {
                        obj.showGroupName = undefined;
                    }
                });
            } else if (questionSlug === 'trip-landing-site') {
                // var island = _.findWhere(respondent.responses, {question: 'island'}).answer.label,
                //     answer = _.findWhere(respondent.responses, {question: questionSlug + '-' + island}).answer;       
                var answer = _.findWhere(respondent.responses, {question: questionSlug}).answer; 
            } else if (questionSlug === 'days-soaked-lobster-traps') {                    
                var unit = _.findWhere(respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.unit,
                    value = _.findWhere(respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.value;
                if (unit.toLowerCase().trim() === 'days') {
                    return value;
                } else {
                    return  Math.floor(value / 24);
                }
            } else if (questionSlug === 'hours-soaked-lobster-traps') {                    
                var unit = _.findWhere(respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.unit,
                    value = _.findWhere(respondent.responses, {question: 'time-soaked-lobster-traps'}).answer.value;
                if (unit.toLowerCase().trim() === 'hours') {
                    return value % 24;
                } else {
                    return  0;
                }
            } else if (questionSlug === 'days-soaked-fish-traps') {                    
                var unit = _.findWhere(respondent.responses, {question: 'time-soaked-fish-traps'}).answer.unit,
                    value = _.findWhere(respondent.responses, {question: 'time-soaked-fish-traps'}).answer.value;
                if (unit.toLowerCase().trim() === 'days') {
                    return value;
                } else {
                    return  Math.floor(value / 24);
                }
            } else if (questionSlug === 'hours-soaked-fish-traps') {                    
                var unit = _.findWhere(respondent.responses, {question: 'time-soaked-fish-traps'}).answer.unit,
                    value = _.findWhere(respondent.responses, {question: 'time-soaked-fish-traps'}).answer.value;
                if (unit.toLowerCase().trim() === 'hours') {
                    return value % 24;
                } else {
                    return  0;
                }
            } else {
                var answer = _.findWhere(respondent.responses, {question: questionSlug}).answer;
            }
            
        } catch(e) {
            var answer = '';
        }
        if (answer === 'NA') {
            answer = '';
        }
        
        return answer;
    };

    

    // Public API here
    return {
      'getTitle': getTitle,
      'gearTypeIncludes': gearTypeIncludes,
      'trapTypeIncludes': trapTypeIncludes,
      'getAnswer': getAnswer
    };
  });
