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
		expect(element('h2').text()).toBe("What is the Vendor's first name?");

		// expect a text question
		expect(element('input').attr('type')).toBe('text');
	});	

	
});


describe('Single Select Tests', function () {
	beforeEach(function () {
		browser().navigateTo('index.html#/survey/resource-origin/vendor-location');	
		expect(browser().location().url()).toBe("/survey/resource-origin/vendor-location");
	});

	it('should have single select question type (radio button)', function () {
		

		expect(element('h2').text()).toBe("Where does the vendor live?");
		// expect a text question
		expect(element('input').attr('type')).toBe('radio');

		expect(repeater('input[type="radio"]').count()).toBe(3);

		expect(element('label:nth-child(1)').text()).toContain("Florence");
		expect(element('label:nth-child(2)').text()).toContain("Naples");
		expect(element('label:nth-child(3)').text()).toContain("Rome");

		expect(repeater('input:checked').count()).toBe(0);
		

	});
})