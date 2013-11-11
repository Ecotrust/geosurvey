describe('Controller: SummaryCtrl', function() {

	beforeEach(module('askApp'));


	var SummaryCtrl, $httpBackend, $location, scope;

	beforeEach(inject(function(_$location_, _$httpBackend_, $rootScope, $controller) {

		$httpBackend = _$httpBackend_;
		$location = _$location_;
		scope = $rootScope.$new();

		SummaryCtrl = $controller('SummaryCtrl', {
			$scope: scope
		});
	}));
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('SummaryCtrl: should request the summary report', function() {
		var data = {
			"results": [{
				"col_text": "Whole Pounds",
				"total": 5.0000000,
				"row_text": "Blackfin"
			}, {
				"col_text": "Whole Pounds",
				"total": 55.0000000,
				"row_text": "Blue Doctor (Blue Tang)"
			}, {
				"col_text": "Whole Pounds",
				"total": 5.0000000,
				"row_text": "Brown Doctor (Doctorfish)"
			}],
			"success": "true"
		};

		$httpBackend.expectGET('http://localhost:8000/reports/distribution/catch-report/weight-*').respond(data);
		$httpBackend.flush();

		expect(scope.summary).toEqual(data.results);
		expect(scope.max).toBe(55);

	});

});