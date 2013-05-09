'use strict';

var answers = {
    age: 36,
    state: {
        value: 1,
        answer: "{u'text': u'Oregon', u'label': u'OR'}"
    }

}

describe('Text Input Tests', function() {
    

    
    it('should display a landing page', function() {

        browser().navigateTo('/respond#/survey/washington-opt-in/uuid');
        expect(browser().location().url()).toBe("/survey/washington-opt-in/uuid");
        expect(element('.landing').text()).toBe('We are conducting a survey of coastal and ocean recreation activities conducted along the Pacific coast of Washington. We want to hear from you even if you have not visited the coast recently.');
        expect(element('.btn').text()).toBe("Go to first question.");
        

    });

    it('should go to the age question', function () {
        element('.btn').click();
        expect(browser().location().url()).toBe("/survey/washington-opt-in/age/uuid");
        expect(element('input').count()).toBe(1);
        expect(element('.question-title').text()).toContain("Please enter your age");
        
    });

    it("should allow the age question to be answered", function() {
        input('answer').enter(answers.age);
        element('.btn').click();
    });

    it("should continue to the state/province question", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/state-or-province/uuid");
        expect(element('.question-title').text()).toContain("What state/province do you live in?");
        expect(repeater('option').count()).toBe(5);
        select('answer').option(answers.state.value);
        element('.btn').click();
    });
    it("should continue to the county question", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/county/uuid");
    });
});
