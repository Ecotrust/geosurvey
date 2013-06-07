'use strict';

describe('Controller: SurveysCtrl', function () {

  // load the controller's module
  beforeEach(module('srcApp'));

  var SurveysCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SurveysCtrl = $controller('SurveysCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
