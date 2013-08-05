// 'use strict';

// describe('Controller: SurveyListCtrl', function() {

//   // load the controller's module
//   beforeEach(module('askApp'));

//   var SurveyListCtrl, $httpBackend, scope;

//   // Initialize the controller and a mock scope
//   beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
//     $httpBackend = _$httpBackend_;
//     $httpBackend.expectGET('/api/v1/survey/?format=json').respond({
//       "meta": {
//         "limit": 20,
//         "next": null,
//         "offset": 0,
//         "previous": null,
//         "total_count": 1
//       },
//       "objects": [{
//         "id": 1,
//         "name": "Cheese Survey",
//         "resource_uri": "/api/v1/survey/1/",
//         "slug": "cheese-survey"
//       },
//       {
//         "id": 2,
//         "name": "Trees Survey",
//         "resource_uri": "/api/v1/survey/2/",
//         "slug": "trees-survey"
//       }]
//     });

//     scope = $rootScope.$new();

//     SurveyListCtrl = $controller('SurveyListCtrl', {
//       $scope: scope
//     });
//   }));

//   it('should attach a list of surveys to the scope', function() {
//     expect(scope.surveys).toBeUndefined();
//     $httpBackend.flush();
//     expect(scope.surveys.length).toBe(2);

//     expect(_.map(scope.surveys, function(survey) {
//       return survey.name;
//     })).toEqual(['Cheese Survey', 'Trees Survey']);

//     expect(_.map(scope.surveys, function(survey) {
//       return survey.slug;
//     })).toEqual(['cheese-survey', 'trees-survey']);

//   });
// });