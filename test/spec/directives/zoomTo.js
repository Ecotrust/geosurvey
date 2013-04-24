'use strict';

describe('Directive: zoomTo', function () {
  beforeEach(module('askApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<zoom-to></zoom-to>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the zoomTo directive');
  }));
});
