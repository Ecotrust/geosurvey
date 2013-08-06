// 'use strict';

// var token = 'csrftoken';

// var response = 
// {"email": "eknuth@ecotrust.org", "resource_uri": "/api/v1/respondant/uuid/", "responses": [{"answer": "36", "id": 125, "question": {"allow_other": false, "hoist_answers": null, "id": 14, "info": "number-trips", "integer_max": 365, "integer_min": 0, "label": "Number of Trips", "lat": null, "lng": null, "min_zoom": 10, "modalQuestion": null, "options": [], "options_from_previous_answer": "", "options_json": "", "order": 5, "question_types": {"auto-single-select": "Single Select with Autocomplete", "datepicker": "Date Picker", "grid": "Grid", "info": "Info Page", "integer": "Integer", "location": "Location", "map-multipoint": "Map with Multiple Points", "multi-select": "Multi Select", "pennies": "Pennies", "single-select": "Single Select", "text": "Text", "textarea": "Text Area"}, "randomize_groups": false, "required": true, "resource_uri": "/api/v1/question/14/", "slug": "number-of-trips", "term_condition": null, "title": "Please estimate how many trips you have made to the Pacific coast of Washington in the last 12 months primarily for recreation purposes (e.g., beach going, wildlife viewing, surfing, kayaking, etc.). A trip is defined as an intentional trip outside of daily routine. ", "type": "integer", "zoom": null}, "resource_uri": "", "ts": "2013-05-09T13:14:42.855272"}], "survey": "/api/v1/survey/3/", "ts": "2013-04-15T18:33:54", "uuid": "uuid"}
// describe('Controller: RespondantDetailCtrl', function() {

//     // load the controller's module
//     beforeEach(module('askApp'));

//     var RespondantDetailCtrl, $httpBackend, scope;


//     // Initialize the controller and a mock scope
//     beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
//         $httpBackend = _$httpBackend_;
//         scope = $rootScope.$new();

//         $routeParams.surveySlug = 'test-survey';
//         $routeParams.uuidSlug = 'uuid-xxxxy';

//         $httpBackend.expectGET('/api/v1/respondant/uuid-xxxxy/?format=json&survey__slug=test-survey').respond(response);

//         RespondantDetailCtrl = $controller('RespondantDetailCtrl', {
//             $scope: scope
//         });

//         $httpBackend.flush();

//     }));


//     afterEach(function() {
//         $httpBackend.verifyNoOutstandingExpectation();
//         $httpBackend.verifyNoOutstandingRequest();
//     });

//     it('should attach a response to the scope', function() {

//         expect(scope.response.email).toBe('eknuth@ecotrust.org');
//         expect(scope.response.uuid).toBe('uuid');
//         expect(scope.response.responses.length).toBe(1)
//     });

//     // it('should have a method for getting a question by slug', function() {
//     //     expect(scope.getResponseBySlug('activity-locations').question.slug).toBe('activity-locations');
//     // })
// });