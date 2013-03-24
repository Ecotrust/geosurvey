'use strict';

describe('Controller: SurveyDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));


  var SurveyDetailCtrl, $httpBackend, scope;

  beforeEach(inject(function(_$httpBackend_, $rootScope,$routeParams, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('surveys/cheeseSurvey.json').respond(
      {name:'Cheese Survey'}
    );

    $routeParams.surveyName = 'cheeseSurvey';
    scope = $rootScope.$new();

    SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
      $scope: scope
    });

  }));


  it('should attach a survey', function () {

    expect(scope.survey).toBeUndefined();
    $httpBackend.flush();
  
    expect(scope.survey.name).toBe("Cheese Survey");
  
  });
});
