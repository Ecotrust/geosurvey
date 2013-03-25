'use strict';

describe('Service: Survey', function () {

  // load the service's module
  beforeEach(module('askApp'));

  // instantiate service
  var Survey;
  beforeEach(inject(function (_Survey_) {
    Survey = _Survey_;
  }));

  it('should do something', function () {
    expect(!!Survey).toBe(true);
  });

});
