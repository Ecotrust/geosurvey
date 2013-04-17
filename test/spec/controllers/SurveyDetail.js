'use strict';

var survey = {
    "id": 1,
    "name": "Test Survey",
    "questions": [{
        "id": 1,
        "label": "Name",
        "options": [],
        "resource_uri": "",
        "slug": "name",
        "title": "What is your name?",
        "type": "text"
    }, {
        "id": 2,
        "label": "Age",
        "options": [],
        "resource_uri": "",
        "slug": "age",
        "title": "How old are you?",
        "type": "text"
    }, {
        "id": 5,
        "label": "Activity Locations",
        "options": [],
        "resource_uri": "",
        "slug": "activity-locations",
        "title": "Activity Locations",
        "type": "map-multipoint"
    }],
    "resource_uri": "/api/v1/survey/1/",
    "slug": "test-survey"
};

var token = 'csrftoken';

describe('Controller: SurveyDetailCtrl', function() {

    // load the controller's module
    beforeEach(module('askApp'));


    var SurveyDetailCtrl, $httpBackend, scope;


    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectGET('/api/v1/survey/test-survey/?format=json').respond(survey);

        $routeParams.surveySlug = 'test-survey';
        $routeParams.questionSlug = 'name';
        $routeParams.uuidSlug = 'uuid-xxxxy'
        scope = $rootScope.$new();

        scope.token = 'csrftoken';

        SurveyDetailCtrl = $controller('SurveyDetailCtrl', {
            $scope: scope
        });

    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should attach a survey', function() {

        expect(scope.survey).toBeUndefined();
        $httpBackend.flush();

        expect(scope.survey.name).toBe('Test Survey');

        expect(scope.question.slug).toBe('name');
    });



    it('should attach a survey with a different question', function() {

        inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $routeParams.questionSlug = 'age';
        });

        $httpBackend.flush();

        expect(scope.question.slug).toBe('age');
    });

    it('should allow a survey question to be answered', function() {

        $httpBackend.flush();

        $httpBackend.expectPOST('/respond/answer/test-survey/name/uuid-xxxxy', {
            'answer': 'Gerald'
        }).respond(201, '');


        scope.answer = 'Gerald';

        scope.answerQuestion(scope.answer);
        $httpBackend.flush();

    });

    it('should get the slug of the next question', function() {
        $httpBackend.flush();
        expect(scope.getNextQuestion()).toBe('age');
    });

    it('should get the path of the next question', function() {
        $httpBackend.flush();
        expect(scope.nextQuestionPath).toBe('survey/test-survey/age/uuid-xxxxy')
    })


    it('should find the end of the survey', function() {

        inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $routeParams.questionSlug = 'activity-locations';
        });

        $httpBackend.flush();

        expect(scope.getNextQuestion()).toBe(null);
    });

    it('should attach a map-multipoint question', function() {

        inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $routeParams.questionSlug = 'activity-locations';
        });

        $httpBackend.flush();

        expect(scope.map.center.lat).toBe(42.505);
        expect(scope.map.center.lng).toBe(-122.59);
        expect(scope.map.zoom).toBe(6);
        expect(scope.map.marker.visibility).toBeTruthy();
        expect(scope.locations.length).toBe(0);
        expect(scope.activeMarker).toBeFalsy();
    });


    it('should add a markerer to the map', function() {

        inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
            $routeParams.questionSlug = 'activity-locations';
        });

        $httpBackend.flush();
        expect(scope.activeMarker).toBeFalsy();
        scope.addMarker();
        expect(scope.activeMarker.lat).toBe(42.505);
        expect(scope.activeMarker.lng).toBe(-122.59);

        //confirm the location
        scope.confirmLocation();
        expect(scope.activeMarker).toBeFalsy();
        expect(scope.locations.length).toBe(1);
    });



});