'use strict';

var token = 'csrftoken';

var response = {
    "email": "eknuth@ecotrust.org",
    "resource_uri": "/api/v1/respondant/uuid/",
    "responses": [{
        "answer": "36",
        "id": 1,
        "question": {
            "id": 3,
            "info": "",
            "label": "Enter your age",
            "modalQuestion": null,
            "options": [],
            "options_json": null,
            "resource_uri": "",
            "slug": "marco-age",
            "title": "Please enter your age:",
            "type": "integer"
        },
        "resource_uri": "",
        "ts": "2013-04-22T16:03:22.352644"
    }, {
        "answer": "DE",
        "id": 2,
        "question": {
            "id": 4,
            "info": "",
            "label": "Pick a state",
            "modalQuestion": null,
            "options": [{
                "id": 4,
                "label": "VA",
                "resource_uri": "",
                "text": "Virgiania"
            }, {
                "id": 5,
                "label": "DE",
                "resource_uri": "",
                "text": "Delaware"
            }, {
                "id": 6,
                "label": "MD",
                "resource_uri": "",
                "text": "Maryland"
            }, {
                "id": 7,
                "label": "NY",
                "resource_uri": "",
                "text": "New York"
            }, {
                "id": 8,
                "label": "NJ",
                "resource_uri": "",
                "text": "New Jersey"
            }],
            "options_json": "",
            "resource_uri": "",
            "slug": "state",
            "title": "What state do you live in?",
            "type": "auto-single-select"
        },
        "resource_uri": "",
        "ts": "2013-04-22T16:03:22.352644"
    }, {
        "answer": "Kent County",
        "id": 3,
        "question": {
            "id": 5,
            "info": "",
            "label": "Pick a county",
            "modalQuestion": null,
            "options": [],
            "options_json": null,
            "resource_uri": "",
            "slug": "county",
            "title": "What county do you live in?",
            "type": "auto-single-select"
        },
        "resource_uri": "",
        "ts": "2013-04-22T16:03:22.352644"
    }, {
        "answer": "[{\"lat\":39.14710270770074,\"lng\":-73.619384765625,\"answers\":[\"Photography\",\"Scenic enjoyment/sightseeing\"]},{\"lat\":39.99395569397331,\"lng\":-73.223876953125,\"answers\":[\"Collection of non-living resources/beachcombing (agates, fossils, driftwood)\"]}]",
        "id": 4,
        "question": {
            "id": 6,
            "info": "",
            "label": "Activity Locations",
            "modalQuestion": {
                "id": 8,
                "info": "",
                "label": "Location Activities",
                "modalQuestion": null,
                "options": [],
                "options_json": "/static/survey/surveys/activities.json",
                "resource_uri": "",
                "slug": "location-activities",
                "title": "Which activities did you conduct at this location?",
                "type": "multi-select"
            },
            "options": [],
            "options_json": "/static/survey/surveys/activities.json",
            "resource_uri": "",
            "slug": "activity-locations",
            "title": "Move and zoom the map to precisely focus the crosshair at each of your activity locations.",
            "type": "map-multipoint"
        },
        "resource_uri": "",
        "ts": "2013-04-22T16:03:22.352644"
    }],
    "ts": "2013-04-15T18:33:54",
    "uuid": "uuid"
};

describe('Controller: RespondantDetailCtrl', function() {

    // load the controller's module
    beforeEach(module('askApp'));

    var RespondantDetailCtrl, $httpBackend, scope;


    // Initialize the controller and a mock scope
    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
        $httpBackend = _$httpBackend_;
        scope = $rootScope.$new();

        $routeParams.surveySlug = 'test-survey';
        $routeParams.uuidSlug = 'uuid-xxxxy';

        $httpBackend.expectGET('/api/v1/respondant/uuid-xxxxy/?format=json').respond(response);

        RespondantDetailCtrl = $controller('RespondantDetailCtrl', {
            $scope: scope
        });

        $httpBackend.flush();

    }));


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should attach a response to the scope', function() {

        expect(scope.response.email).toBe('eknuth@ecotrust.org');
        expect(scope.response.uuid).toBe('uuid');
        expect(scope.response.responses.length).toBe(4)
    });

    it('should have a method for getting a question by slug', function() {
        expect(scope.getResponseBySlug('activity-locations').question.slug).toBe('activity-locations');
    })
});