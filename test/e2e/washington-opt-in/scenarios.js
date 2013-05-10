'use strict';

var answers = {
    age: 36,
    state: {
        value: 1,
        answer: "{u'text': u'Oregon', u'label': u'OR'}"
    },
    county: {
        value: 10,
        answer: "{u'link_title': None, u'description': None, u'fips_class': u'H1', u'url': u'http://www.co.harney.or.us/', u'name': u'Harney County', u'feature_id': u'38762', u'state_name': u'Oregon', u'fips_county_cd': u'25', u'state_abbreviation': u'OR', u'full_county_name': None, u'county_name': None, u'primary_latitude': u'43.16', u'primary_longitude': u'-119', u'feat_class': u'Civil'}"
    },
    activities: [],
    numberOfTrips: 5
};

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
        expect(element('.question-title').text()).toContain("You indicated you live in Oregon. What county/municipality do you live in?");
        expect(repeater('option').count()).toBe(34);
        select('answer').option(answers.county.value);
        element('.btn').click();
    });

    it("should continue to the info page", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/recreate-info/uuid");
        expect(element('.info').text()).toContain("Pacific coast of Washington");
        element('.btn').click();
    });
    it("should continue to the info page", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/activities/uuid");
        expect(element('.question-title').text()).toContain('Which of the following recreation');
        expect(repeater('.question li').count()).toBe(21);

        element('.question li:contains(Camping)').click();
        element('.question li:contains(Photography)').click();

        element('.btn').click();
        
    });

    it("should continue to the number of trips question", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/number-of-trips/uuid");
        input('answer').enter(answers.numberOfTrips);
        element('.btn').click();
    });

    it("should continue to the location info page", function () {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/activity-locations-intro/uuid");
        expect(element('.info').text()).toContain('You will now be asked to map the locations at which you participated in the recreation activities listed below from the last 12 months.');
        expect(element('.well').text()).toContain('Photography');
        expect(element('.well').text()).toContain('Camping');
        element('.btn').click();
    });
    it("should continue to the activity locations question", function() {
        expect(browser().location().url()).toBe("/survey/washington-opt-in/activity-locations/uuid");
        expect(element('.question-title').text()).toContain('Navigate the map or use the search function to zoom to the areas which you conducted');
        expect(element('h2').text()).toContain('Navigate the map or use the search function to zoom to the areas which you conducted');
        element('button:contains(My Activities)').click();
        expect(element('.modal:visible').count()).toBe(1);
        expect(element('.modal-header').text()).toContain('Activities you selected');
        expect(element('.modal-body').text()).toContain('Photography');
        expect(element('.modal-body').text()).toContain('Camping');
        element('.modal button:contains(Close)').click();
        expect(element('.modal:visible').count()).toBe(0);
    });
});
