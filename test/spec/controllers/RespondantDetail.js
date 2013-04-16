'use strict';

var token = 'csrftoken';

var response = {
    "email": "eknuth@ecotrust.org",
    "resource_uri": "/api/v1/respondant/e60fcfd0-1213-4cbc-8cc6-add5352675bb/",
    "responses": [{
        "answer": "test",
        "id": 1,
        "question": {
            "id": 1,
            "label": "Name",
            "options": [],
            "resource_uri": "",
            "slug": "name",
            "title": "What is your name?",
            "type": "text"
        },
        "resource_uri": "",
        "ts": "2013-04-15T18:37:32.181676"
    }, {
        "answer": "33",
        "id": 2,
        "question": {
            "id": 2,
            "label": "Age",
            "options": [],
            "resource_uri": "",
            "slug": "age",
            "title": "How old are you?",
            "type": "text"
        },
        "resource_uri": "",
        "ts": "2013-04-15T18:37:32.181676"
    }],
    "ts": "2013-04-15T18:33:54",
    "uuid": "e60fcfd0-1213-4cbc-8cc6-add5352675bb"
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
        expect(scope.response.uuid).toBe('e60fcfd0-1213-4cbc-8cc6-add5352675bb');
        expect(scope.response.responses.length).toBe(2)
    });
});