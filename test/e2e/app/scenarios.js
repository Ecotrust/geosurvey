'use strict';


describe('Geosurvey App', function() {
    
    beforeEach(function () {
        browser().navigateTo('/respond');
    });

    it('should redirect index.html to index.html', function() {
        expect(browser().location().url()).toBe('/');
        
        expect(element('h2').text()).toBe('Please sign in');
        
    });

    it('should go to landing page of the survey', function () {
        // TODO: landing page
    }); 

    
    
});

describe('Text Input Tests', function () {

    beforeEach(function () {
        browser().navigateTo('/respond#/survey/test-survey/name/uuid');   
    });

    it('should display a question with a text input', function () {
        expect(browser().location().url()).toBe("/survey/test-survey/name/uuid");
        expect(element('h2').text()).toBe('What is your name?');
    });

    it("should allow the question to be answered and advance to the next question", function() {
          input('question.answer').enter('Gerald');

    });
})


