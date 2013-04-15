'use strict';

var token = 'csrftoken';

var response = {
    "email": "eknuth@ecotrust.org",
    "resource_uri": "/api/v1/respondant/uuid/",
    "ts": "2013-04-11T17:32:15.290000",
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
    });
});