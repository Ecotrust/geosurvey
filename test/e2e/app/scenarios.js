'use strict';


describe('Geosurvey App', function() {
	
	beforeEach(function () {
		browser().navigateTo('/survey/index.html');	
	});

	it('should redirect index.html to index.html', function() {
		expect(browser().location().url()).toBe('/');
		
		expect(element('h2').text()).toBe('Please sign in');
		expect(repeater('.survey-list li').count()).toBe(5);
	});

	it('should go to first question of the survey', function () {
		element('.survey-list li:first-child a').click();
		expect(browser().location().url()).toBe("/survey/resource-origin/first-name/uuid");
		expect(element('h2').text()).toBe("What is the Vendor's first name?");

		// expect a text question
		expect(element('input').attr('type')).toBe('text');
	});	

	
	
});

describe('Text Input Tests', function () {

	beforeEach(function () {
		browser().navigateTo('/survey/index.html#/survey/resource-origin/first-name/uuid');	
	});

	it('should advance to next question when clicking continue', function () {
		expect(browser().location().url()).toBe("/survey/resource-origin/first-name/uuid");
		element('button').click();
		expect(browser().location().url()).toBe("/survey/resource-origin/vendor-location/uuid");
	});
})


describe('Single Select Tests', function () {
	beforeEach(function () {
		browser().navigateTo('/survey/index.html#/survey/resource-origin/vendor-location/uuid');	
		expect(browser().location().url()).toBe("/survey/resource-origin/vendor-location/uuid");
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