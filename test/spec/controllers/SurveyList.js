'use strict';

describe('Controller: SurveyListCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var SurveyListCtrl, $httpBackend, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('surveys/all.json').respond(
      [
        {
          'name':'Cheese Survey',
          'slug':'cheese-survey',
          'firstQuestion': 'favorite-cheese'
        }, 
        {
          'name':'Trees Survey',
          'slug':'trees-survey',
          'firstQuestion': 'favorite-tree'
        }]
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
    
    expect(_.map(scope.surveys,
      function (survey) { return survey.name; } )).toEqual([ 'Cheese Survey', 'Trees Survey' ]);
    expect(_.map(scope.surveys,
      function (survey) { return survey.slug; } )).toEqual([ 'cheese-survey', 'trees-survey' ]);
    expect(_.map(scope.surveys,
      function (survey) { return survey.firstQuestion; } )).toEqual([ 'favorite-cheese', 'favorite-tree' ]);
  });
});
