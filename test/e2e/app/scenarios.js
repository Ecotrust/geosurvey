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

    
    it('should display a question with a text input', function() {
        expect(browser().location().url()).toBe('/survey/test-survey/name/uuid');
        expect(element('h2').text()).toBe('What is your name?');
    });

});

// describe('Full Survey Test', function () {
//     beforeEach(function() {
//         browser().navigateTo('/respond#/survey/test-survey/age/uuid');
//     });

//     afterEach(function () {
//         browser().navigateTo('/respond/delete/uuid');
//     });

//     it('should allow the questions to be answered and advance to the next question to the complete page', function() {
//         var name = 'Gerald', age = "36";

//         expect(browser().location().url()).toBe('/survey/test-survey/age/uuid');
//         input('answer').enter(age);
//         element('.btn').click();
//         expect(browser().location().url()).toBe('/survey/test-survey/name/uuid');
//         input('answer').enter(name);
//         element('.btn').click();
//         expect(browser().location().url()).toBe('/survey/test-survey/activity-locations/uuid');
//         expect(element('.btn.pull-left:visible').text()).toBe(" My Activities");
//         expect(element('.btn.pull-right:visible').text()).toBe(" Add Location");

//         element('.btn.pull-right:visible').click();

//         expect(element('.btn.confirm:visible').text()).toBe("Yes");
//         expect(element('.btn.cancel:visible').text()).toBe("No, let's try again");
//         element('.btn.cancel:visible').click();
//         expect(element('.btn.pull-right:visible').text()).toBe(" Add Location");

//         // confirm the location and open a modal
//         element('.btn.pull-right:visible').click();
//         element('.btn.confirm:visible').click();

//         // must be logged in to go to the respondant view
//         browser().navigateTo('/respond#/RespondantDetail/uuid');

//         expect(browser().location().url()).toBe('/RespondantDetail/uuid');
//         expect(element('.name dt').text()).toBe("What is your name?");
//         expect(element('.name dd').text()).toBe(name);

//         expect(element('.age dt').text()).toBe("How old are you?");
//         expect(element('.age dd').text()).toBe(age);
//     });
// });

describe('Grid Question Test', function () {

    beforeEach(function() {
        browser().navigateTo('/respond#/survey/test-survey/some-activities/uuid');
        expect(browser().location().url()).toBe('/survey/test-survey/some-activities/uuid');
    });

    afterEach(function () {
        browser().navigateTo('/respond/delete/uuid');
    });

    it('should have a multi-select question', function () {

        // answer a multi select question
        expect(repeater('label').count()).toBe(4);
        element('#checkbox2').click();
        element('#checkbox3').click();
        element('.btn').click();




        browser().navigateTo('/respond#/RespondantDetail/uuid');
        expect(browser().location().url()).toBe('/RespondantDetail/uuid');
        expect(element('.some-activities dt').text()).toBe("What are some activities?");
        expect(element('.some-activities dd').text()).toBe("[{u'text': u'Second Option', u'resource_uri': u'', u'checked': True, u'id': 69, u'label': u'second-option'}, {u'text': u'Third Option', u'resource_uri': u'', u'checked': True, u'id': 70, u'label': u'third-option'}]");
    });

})