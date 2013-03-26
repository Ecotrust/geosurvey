'use strict';

describe('Service: offlineSurvey', function () {

  // load the service's module
  beforeEach(module('askApp'));

  // instantiate service
  var offlineSurvey;
  beforeEach(inject(function (_offlineSurvey_) {
    offlineSurvey = _offlineSurvey_;
  }));

  afterEach(function () {
    amplify.store("survey-slug:question-slug", null)    
  })
  it('should use amplify.store to save a value', function () {
    // record
    expect(offlineSurvey.answerQuestion(
      { slug: 'survey-slug' },
      { slug: 'question-slug' },
      'blue')).toBe('blue');

    expect(amplify.store("survey-slug:question-slug")).toBe('blue');

  });
  
});
