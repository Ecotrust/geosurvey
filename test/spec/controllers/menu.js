'use strict';

describe('Controller: MenuCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var MenuCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    MenuCtrl = $controller('MenuCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of menu items to the scope', function () {
    expect(scope.menuItems.length).toBe(2);
    
  });
});
