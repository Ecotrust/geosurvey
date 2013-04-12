'use strict';

var survey = {
    "name":'Cheese Survey',
    "slug": 'cheese-survey',
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
      },
      {
        "title": "Where does your favorite cheese come from?",
        "slug": "favorite-cheese-location",
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
    $httpBackend.expectGET('/survey/surveys/cheese-survey.json').respond(survey);

    $routeParams.surveySlug = "cheese-survey";
    $routeParams.questionSlug = 'favorite-cheese-color';
    scope = $rootScope.$new();

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
   

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

  it('should allow a survey question to be answered', function () {
      
      $httpBackend.flush();
      
      $httpBackend.expectPOST('/respond/answer', {
        'survey': 'cheese-survey',
        'question': 'favorite-cheese-color',
        'answer': "Blue"
      }).respond(201, '');
      
      
      scope.answer = "Blue";
      
      scope.answerQuestion();
      $httpBackend.flush();

  });

  it('should get the slug of the next question', function () {
    $httpBackend.flush();
    expect(scope.getNextQuestion()).toBe('favorite-cheese-smell');
  })

});
describe('Controller: SurveyDetailCtrl Offline', function () {

  // load the controller's module
  beforeEach(module('askApp'));


  var SurveyDetailCtrl, $httpBackend, scope;

  beforeEach(inject(function(_$httpBackend_, $rootScope,$routeParams, $controller) {
    $httpBackend = _$httpBackend_;
    survey.offline = true;
    $httpBackend.expectGET('/survey/surveys/cheese-survey-offline.json').respond(survey);


    $routeParams.surveySlug = "cheese-survey-offline";
    $routeParams.questionSlug = 'favorite-cheese-smell';
    scope = $rootScope.$new();

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });
    $httpBackend.flush();

  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
   

  it('should attach a survey for offline use', function () {    

    expect(scope.question.slug).toBe("favorite-cheese-smell");
    expect(scope.survey.offline).toBeTruthy();
  
  });

  it('should not post when answering an offline question', function () {
    
    scope.answer = "Stinky";
    scope.answerQuestion();

    // TODO: need to mock up offlineSurvey
    // this actually leaves behind a key
    // this test proves that the $http.post is not called
    amplify.store('cheese-survey:favorite-cheese-smell', null);  
  })

});
