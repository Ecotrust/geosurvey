'use strict';

var survey = {
  "id": 1,
  "name": "Test Survey",
  "questions": [{
    "id": 1,
    "label": "Name",
    "options": [],
    "resource_uri": "",
    "slug": "name",
    "title": "What is your name?",
    "type": "text"
  }, {
    "id": 2,
    "label": "Age",
    "options": [],
    "resource_uri": "",
    "slug": "age",
    "title": "How old are you?",
    "type": "text"
  }],
  "resource_uri": "/api/v1/survey/1/",
  "slug": "test-survey"
};

var token = "csrftoken";

describe('Controller: SurveyDetailCtrl', function() {

  // load the controller's module
  beforeEach(module('askApp'));


  var SurveyDetailCtrl, $httpBackend, scope;


  beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/v1/survey/test-survey/?format=json').respond(survey);

    $routeParams.surveySlug = "test-survey";
    $routeParams.questionSlug = 'name';
    $routeParams.uuidSlug = 'uuid-xxxxy'
    scope = $rootScope.$new();

    scope.token = "csrftoken";

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });


  it('should attach a survey', function() {

    expect(scope.survey).toBeUndefined();
    $httpBackend.flush();

    expect(scope.survey.name).toBe("Test Survey");

    expect(scope.question.slug).toBe("name");
  });



  it('should attach a survey with a different question', function() {

    inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $routeParams.questionSlug = 'age';
    });

    $httpBackend.flush();

    expect(scope.question.slug).toBe("age");
  });

  it('should allow a survey question to be answered', function() {

    $httpBackend.flush();

    $httpBackend.expectPOST('/respond/answer/test-survey/name/uuid-xxxxy', {
      'answer': "Gerald"
    }).respond(201, '');


    scope.answer = "Gerald";

    scope.answerQuestion(scope.answer);
    $httpBackend.flush();

  });

  it('should get the slug of the next question', function() {
    $httpBackend.flush();
    expect(scope.getNextQuestion()).toBe('age');
  })

});