'use strict';


describe('Geosurvey App', function() {
	
	beforeEach(function () {
		browser().navigateTo('index.html');	
	});

	it('should redirect index.html to index.html', function() {
		expect(browser().location().url()).toBe('/');
		
		expect(element('h2').text()).toBe('Please sign in');
		expect(repeater('.survey-list li').count()).toBe(3);
	});

	it('should launch a survey', function () {
		element('.survey-list li:first-child a').click();
		expect(browser().location().url()).toBe("/survey/resource-origin/first-name");
		expect(element('h2').text()).toBe("Enter the Vendor's first name.");
	});	

});