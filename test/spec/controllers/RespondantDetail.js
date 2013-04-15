'use strict';

var token = 'csrftoken';

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

        $httpBackend.expectGET('/api/v1/respondant/?format=json').respond({});

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
        
        expect(scope.awesomeThings.length).toBe(3);
    });
});