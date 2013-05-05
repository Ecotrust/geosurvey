'use strict';

// loading survey from fixture

describe('Controller: AuthorCtrl', function() {

    // load the controller's module
    beforeEach(module('askApp'));

    var AuthorCtrl, $httpBackend, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
        $httpBackend = _$httpBackend_;
        $routeParams.surveySlug = 'test-survey';
        scope = $rootScope.$new();

        $httpBackend.expectGET('/api/v1/survey/test-survey/?format=json').respond(survey);

        AuthorCtrl = $controller('AuthorCtrl', {
            $scope: scope
        });

        $httpBackend.flush();
    }));


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should attach a list of awesomeThings to the scope', function() {
        expect(scope.survey.slug).toBe('test-survey');
    });
});