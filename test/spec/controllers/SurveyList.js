'use strict';

describe('Controller: SurveyListCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var SurveyListCtrl, $httpBackend, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('surveys/all.json').respond(
      [{name:'Cheese Survey'}, {name:'Trees Survey'}]
    );

    scope = $rootScope.$new();

    SurveyListCtrl = $controller('SurveyListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of surveys to the scope', function () {
    expect(scope.surveys).toBeUndefined();
    $httpBackend.flush();
    expect(scope.surveys.length).toBe(2);
  });
});
