'use strict';

describe('Controller: LandingCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var LandingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    LandingCtrl = $controller('LandingCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
