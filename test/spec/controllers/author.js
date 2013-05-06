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

    it('should attach a survey to the scope', function() {
        expect(scope.survey.slug).toBe('test-survey');
        expect(scope.survey.questions.length).toBe(5);
        expect(scope.activeQuestion.title).toBe(survey.questions[0].title);
    });

    it('should have a method to start editing a question', function () {
        var question = scope.survey.questions[2];

        scope.startEditingQuestion(question);
        
        // should make a copy of question
        expect(_.isEqual(scope.activeQuestion, question)).toBeTruthy();
        // should be a different object
        expect(scope.activeQuestion).not.toBe(question);
        // but we should have a reference to the original question
        expect(scope.questionBeingEdited).toBe(question);
    });

    it('should have a method to test if a question has changed', function () {
        var question = scope.survey.questions[2];

        scope.startEditingQuestion(question);

        expect(scope.questionIsDirty(scope.activeQuestion)).toBeFalsy();
        scope.activeQuestion.title = 'Change the title';
        expect(scope.questionIsDirty(scope.activeQuestion)).toBeTruthy();

        scope.activeQuestion.title = question.title;
        expect(scope.questionIsDirty(scope.activeQuestion)).toBeFalsy();
    });

    it('should have a method to save the question', function () {
        var question = scope.survey.questions[1];
        
        scope.startEditingQuestion(question);
        scope.activeQuestion.title = "This is an edit.";
        $httpBackend.expectPUT('/api/v1/question/2').respond(202, scope.activeQuestion);
        scope.saveQuestion(scope.activeQuestion);
        $httpBackend.flush();
        expect(scope.survey.questions[1].title).toBe("This is an edit.");


    });
});