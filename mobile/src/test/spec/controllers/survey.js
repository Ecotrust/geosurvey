'use strict';

describe('Controller: SurveyCtrl', function () {

  // load the controller's module
  beforeEach(module('srcApp'));

  var SurveyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SurveyCtrl = $controller('SurveyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
