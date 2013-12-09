var app = {
	version: '1.2.61',
	server: 'http://localhost:8000',
	stage: 'dev',
	user: {
		username: 'fish',
		registration: {
			'first-name': "Fisher Person"
		}
	}
}

describe('Controller: MainCtrl', function() {

	beforeEach(module('askApp'));


	var MainCtrl, $httpBackend, $location, storage, scope;

	beforeEach(inject(function(_$location_, _$httpBackend_, $rootScope, $controller, _storage_) {

		
		$httpBackend = _$httpBackend_;
		$location = _$location_;
		scope = $rootScope.$new();
		storage = _storage_;
		storage.saveState = jasmine.createSpy("saveState() spy");

		MainCtrl = $controller('MainCtrl', {
			$scope: scope
		});

		$httpBackend.expectGET('http://localhost:8000/mobile/getVersion').respond({
			version: "1.2.62",
			success: true
		});
		$httpBackend.flush();
		expect(scope.update).toBe('An update is available for Digital Deck.');

	}));
	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should set up some items on the scope', function() {
		expect(scope.version).toBe('1.2.61');
		expect(scope.user.username).toBe('fish');
	});

	it('createUser: should give an error with mismatched email addresses', function() {
		scope.createUser({
			emailaddress1: 'test@test.com',
			emailaddress2: 'test2@test.com'
		});
		expect(scope.showError).toBe('email-mismatch');
	});

	it('createUser: should create a user', function() {
		$httpBackend.expectPOST('http://localhost:8000/account/createUser').respond({
			user: {
				username: 'test'
			},
			success: true
		});

		scope.createUser({
			emailaddress1: 'test@test.com',
			emailaddress2: 'test@test.com'
		});

		expect(scope.working).toBe(true);
		expect(scope.showError).toBe(false);

		$httpBackend.flush();
		expect(app.user.username).toBe('test');
		expect(storage.saveState).toHaveBeenCalled();
	});

	it('authenticateUser: should auth a user', function() {
		$httpBackend.expectPOST('http://localhost:8000/account/authenticateUser').respond({
			"user": {
				"username": "fisher",
				"is_staff": true,
				"name": " ",
				"registration": "{\"first-name\": \"Fisher\", \"license-number\": \"AK99\"}"
			},
			"success": true
		});

		scope.authenticateUser({
			username: 'fisher',
			password: 'sasquatch'
		});

		expect(scope.working).toBe(true);
		expect(scope.showError).toBe(false);

		$httpBackend.flush();
		expect(app.user.username).toBe('fisher');
		expect(app.pw).toBe('sasquatch');
		expect(app.user.registration['first-name']).toBe("Fisher");
		expect(app.user.registration['license-number']).toBe("AK99");
		expect(storage.saveState).toHaveBeenCalled();
	});

	it('logout: should logout a user', function() {
		spyOn($location, 'path');
		expect(app.user.username).toBe('fisher');

		scope.logout();

		expect(app.user).toBe(false);
		expect(storage.saveState).toHaveBeenCalled();
		expect($location.path).toHaveBeenCalledWith('/');
	});

	it('offline: should let a user operate offline', function() {
		scope.offline({
			username: 'offlineUser'
		}, 'signin');
		expect(app.user.username).toBe('offlineUser');
		expect(app.offlineUser.username).toBe('offlineUser');
		expect(app.user.status).toBe('signin');
		expect($location.path()).toBe('/main');
	});

	it('updateApp: should open the a window to update the app', function () {
		window.open = jasmine.createSpy("open() spy");
		scope.updateApp();
		expect(window.open).toHaveBeenCalledWith('http://localhost:8000/downloads/update.html', '_blank', 'location=yes');
	});
});