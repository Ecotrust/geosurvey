'use strict';

describe('Controller: MapViewCtrl', function () {

  // load the controller's module
  beforeEach(module('askApp'));

  var MapViewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    MapViewCtrl = $controller('MapViewCtrl', {
      $scope: scope
    });
  }));

});
