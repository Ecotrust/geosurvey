'use strict';

var survey = {
    "name":'Cheese Survey',
    "questions": [
      {
        "title": "What is your favorite cheese?",
        "slug": "favorite-cheese",
        "type": "text"
      }
    ]
  }

describe('Controller: SurveyDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));


  var SurveyDetailCtrl, $httpBackend, scope;

  beforeEach(inject(function(_$httpBackend_, $rootScope,$routeParams, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('surveys/cheese-survey.json').respond(survey);

    $routeParams.surveySlug = 'cheese-survey';
    scope = $rootScope.$new();

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });

  }));


  it('should attach a survey', function () {

    expect(scope.survey).toBeUndefined();
    $httpBackend.flush();
  
    expect(scope.survey.name).toBe("Cheese Survey");
  
    expect(scope.question.slug).toBe("favorite-cheese");
  });
});
