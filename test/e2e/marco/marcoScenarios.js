'use strict';


describe('Geosurvey App', function() {

    beforeEach(function() {
        browser().navigateTo('/respond#/survey/marco/a352a35e-89a2-43b9-894c-35927145f19e');
    });

    it('should redirect index.html to index.html', function() {
        expect(browser().location().url()).toBe("/survey/marco/a352a35e-89a2-43b9-894c-35927145f19e");

        expect(element('h1').text()).toBe('MARCO Survey');

    });



});