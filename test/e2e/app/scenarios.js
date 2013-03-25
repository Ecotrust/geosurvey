'use strict';


describe('Geosurvey App', function() {
	
  it('should redirect index.html to index.html', function() {
    browser().navigateTo('../../app/index.html');
    
    expect(browser().location().url()).toBe('/');
  });

   

});