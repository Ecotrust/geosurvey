'use strict';

var answers = {
    age: _.random(18, 78),
    county: {
        value: 10,
        answer: "{u'link_title': None, u'description': None, u'fips_class': u'H1', u'url': u'http://www.co.harney.or.us/', u'name': u'Harney County', u'feature_id': u'38762', u'state_name': u'Oregon', u'fips_county_cd': u'25', u'state_abbreviation': u'OR', u'full_county_name': None, u'county_name': None, u'primary_latitude': u'43.16', u'primary_longitude': u'-119', u'feat_class': u'Civil'}"
    },
    activities: [],
    numberOfTrips: 5
};
var options = {
    state: {
        0: {
            value: 0,
            name: "Washington",
            counties: 38,
            answer: "{u'text': u'Washington', u'label': u'WA'}"
        },
        1: {
            value: 1,
            name: "Oregon",
            answer: "{u'text': u'Oregon', u'label': u'OR'}",
            counties: 34
        },
        2: {
            value: 2,
            name: "British Columbia",
            counties: 52,
            answer: "{u'text': u'British Columbia', u'label': u'BC'}"
        }
    }
}

var uuid, total_places, places=[];

$.ajax({
    url: '/respond/catch-report?get-uid=true',
    dataType: 'json',
    success: function (data) {
        uuid = data.uuid;
    },
    async: false
});



describe('USVI Tests', function() {
    it('should display a landing page', function() {
        browser().navigateTo('/respond#/survey/catch-report/0/' + uuid + '/landing');
        expect(browser().location().url()).toBe("/survey/catch-report/0/" + uuid + '/landing');
        expect(element('.btn:visible').text()).toBe("Go to first question.");
        element('.btn:visible').click();
    });

    it('should go to the landed date question', function () {
        expect(browser().location().url()).toBe("/survey/catch-report/1/" + uuid);
        expect(element('h4').text()).toContain("Landed Date");
        expect(element('input').count()).toBe(1);
        input('page.question[0].answer').enter('2013-04-08T19:29:18.759Z');
        element('.btn:visible').click();
    });
    it('should go to the island question and click a single select', function () {
        expect(browser().location().url()).toBe("/survey/catch-report/2/" + uuid);
        expect(element('.question-title').text()).toContain("Island");
        expect(repeater('.option:visible').count()).toBe(3);
        element('.option:nth-child(2)').click();
        expect(element('.option:nth-child(2)').attr('class')).toContain('todo-done');
        element('.btn:visible').click();
    });

    it('should go to the landing site question', function () {
        expect(browser().location().url()).toBe("/survey/catch-report/4/" + uuid);
        expect(element('.question-title').text()).toContain("Trip Landing Site (St. Thomas)");
        expect(repeater('.option-name:visible').count()).toBe(24);
        element('.option:nth-child(5)').click();
        element('.btn:visible').click();
    });


    // it("should allow the age question to be answered", function() {
    //     input('answer').enter(answers.age);
    //     element('.btn').click();
    // });

    // it("should continue to the state/province question", function () {
    //     answers.state = _.random(2);

    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/state-or-province/" + uuid);
    //     expect(element('.question-title').text()).toContain("What state/province do you live in?");
    //     expect(repeater('option').count()).toBe(5);
    //     select('answer').option(answers.state);
    //     element('.btn').click();
    // });

    // it("should continue to the county question", function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/county/" + uuid);
    //     expect(element('.question-title').text()).toContain("You indicated you live in " + options.state[answers.state].name +  ". What county/municipality do you live in?");
    //     expect(repeater('option').count()).toBe(options.state[answers.state].counties);
    //     select('answer').option(_.random(options.state[answers.state].counties-2));
    //     element('.btn').click();
    // });

    // it("should continue to the info page", function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/recreate-info/" + uuid);
    //     expect(element('.info').text()).toContain("Pacific coast of Washington");
    //     element('.btn').click();
    // });
    // it("should continue to the info page", function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/activities/" + uuid);
    //     expect(element('.question-title').text()).toContain('Which of the following recreation');
    //     expect(repeater('.question li').count()).toBe(21);

    //     element('.question li:nth-child(' + _.random(1,20) + ')').click();
    //     element('.question li:nth-child(' + _.random(1,20) + ')').click();
    //     element('.question li:nth-child(' + _.random(1,20) + ')').click();

    //     element('.btn').click();
    // });

    // it("should continue to the number of trips question", function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/number-of-trips/" + uuid);
    //     input('answer').enter(_.random(1,20));
    //     element('.btn').click();
    // });

    // it("should continue to the location info page", function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/activity-locations-intro/" + uuid);
    //     expect(element('.info').text()).toContain('You will now be asked to map the locations at which you participated in the recreation activities listed below from the last 12 months.');
    //     // expect(element('.well').text()).toContain('Photography');
    //     // expect(element('.well').text()).toContain('Camping');
    //     element('.btn').click();
    // });
    // it("should continue to the activity locations question", function() {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/activity-locations/" + uuid);
    //     expect(element('.question-title').text()).toContain('Navigate the map or use the search function to zoom to the areas which you conducted');
    //     expect(element('h2').text()).toContain('Navigate the map or use the search function to zoom to the areas which you conducted');
    //     element('button:contains(My Activities)').click();
    //     expect(element('.modal:visible').count()).toBe(1);
    //     expect(element('.modal-header').text()).toContain('Activities you selected');
    //     // expect(element('.modal-body').text()).toContain('Photography');
    //     // expect(element('.modal-body').text()).toContain('Camping');
    //     element('.modal button:contains(Close)').click();
    //     expect(element('.modal:visible').count()).toBe(0);
    //     expect(element('button:contains(Add Location):visible').count()).toBe(0);
    //     input('map.zoom').enter('15');

    //     expect(element('.btn:contains(Yes):visible').count()).toBe(0);
    //     expect(element('.btn:contains(No):visible').count()).toBe(0);
    //     _.each(places, function (place) {
    //         input('map.marker.lat').enter(place.lat);
    //         input('map.marker.lng').enter(place.lng);

    //         expect(element('h2').text()).toContain("Please zoom in to ensure accurate placement.");
    //         expect(element('button:contains(Add Location):visible').count()).toBe(1);


    //         element('button:contains(Add Location)').click();
    //         expect(element('h2:visible').text()).toContain("Is this location correct?");
    //         expect(element('.btn:contains(Yes):visible').count()).toBe(1);
    //         expect(element('.btn:contains(No):visible').count()).toBe(1);

    //         expect(element('.btn:contains(continue):visible').count()).toBe(0);
    //         element('.btn:contains(Yes):visible').click();

    //         expect(element('.modal .question-title').text()).toContain('Which of the following recreational activities did you participate in at this location?');
    //         // expect(repeater('.hoisted li').count()).toBe(2);

    //         element('.hoisted li:nth-child(' + _.random(1,2) + ')').click();
    //         element('.btn:contains(Save):visible').click();
    //         expect(element('.modal:visible').count()).toBe(0);
    //         expect(element('.btn:contains(continue):visible').count()).toBe(1);
    //     });
    //     element('.btn:contains(continue):visible').click();

    // });

    // it('should continue to the location review page', function () {
    //     expect(browser().location().url()).toBe("/survey/washington-opt-in/last-trip/" + uuid);
    // });
});
