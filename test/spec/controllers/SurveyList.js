'use strict';

describe('Controller: SurveyListCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var SurveyListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    SurveyListCtrl = $controller('SurveyListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
