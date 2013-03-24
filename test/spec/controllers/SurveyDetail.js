'use strict';

var survey = {
    "name":'Cheese Survey',
    "questions": [
      {
        "title": "What is your favorite cheese?",
        "slug": "favorite-cheese",
        "type": "text"
      },
      {
        "title": "What is color your favorite cheese?",
        "slug": "favorite-cheese-color",
        "type": "text"
      },
      {
        "title": "What does your favorite cheese smell like?",
        "slug": "favorite-cheese-smell",
        "type": "text"
      }
    ]
  };

describe('Controller: SurveyDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));


  var SurveyDetailCtrl, $httpBackend, scope;

  beforeEach(inject(function(_$httpBackend_, $rootScope,$routeParams, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('surveys/cheese-survey.json').respond(survey);

    $routeParams.surveySlug = "cheese-survey";
    $routeParams.questionSlug = 'favorite-cheese-color';
    scope = $rootScope.$new();

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });

  }));


  it('should attach a survey', function () {

    expect(scope.survey).toBeUndefined();
    $httpBackend.flush();
  
    expect(scope.survey.name).toBe("Cheese Survey");
  
    expect(scope.question.slug).toBe("favorite-cheese-color");
  });


  

  it('should attach a survey with a different question', function () {
    inject(function(_$httpBackend_, $rootScope,$routeParams, $controller) {
      $routeParams.questionSlug = 'favorite-cheese-smell';
    });
    $httpBackend.flush();
    expect(scope.question.slug).toBe("favorite-cheese-smell");
  });
});
