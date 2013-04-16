'use strict';


describe('Geosurvey App', function() {
    beforeEach(function() {
        browser().navigateTo('/respond');
    });

    it('should redirect index.html to index.html', function() {
        expect(browser().location().url()).toBe('/');

        expect(element('h2').text()).toBe('Please sign in');

    });

    it('should go to landing page of the survey', function() {
        // TODO: landing page
    });


});

describe('Text Input Tests', function() {

    beforeEach(function() {
        browser().navigateTo('/respond#/survey/test-survey/name/uuid');
    });

    afterEach(function () {
        browser().navigateTo('/respond/delete/uuid');
    })

    it('should display a question with a text input', function() {
        expect(browser().location().url()).toBe('/survey/test-survey/name/uuid');
        expect(element('h2').text()).toBe('What is your name?');
    });

    it('should allow the questions to be answered and advance to the next question to the complete page', function() {
        var name = 'Gerald', age = "36";

        input('answer').enter(name);
        element('button').click();
        expect(browser().location().url()).toBe('/survey/test-survey/age/uuid');
        input('answer').enter(age);
        element('button').click();
        expect(browser().location().url()).toBe('/survey/test-survey/complete/uuid');

        // must be logged in to go to the respondant view
        browser().navigateTo('/respond#/RespondantDetail/uuid');
        expect(browser().location().url()).toBe('/RespondantDetail/uuid');
        expect(element('.name dt').text()).toBe("What is your name?");
        expect(element('.name dd').text()).toBe(name);

        expect(element('.age dt').text()).toBe("How old are you?");
        expect(element('.age dd').text()).toBe(age);
    });
});