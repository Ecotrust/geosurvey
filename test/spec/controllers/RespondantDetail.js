'use strict';

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

        RespondantDetailCtrl = $controller('RespondantDetailCtrl', {
            $scope: scope
        });

        
    }));


    afterEach(function() {
        // $httpBackend.verifyNoOutstandingExpectation();
        // $httpBackend.verifyNoOutstandingRequest();
    });

    it('should attach a response to the scope', function() {
        $httpBackend.expectGET('/api/v1/respondant/?format=json').respond({});

        //expect(scope.awesomeThings.length).toBe(3);
    });
});