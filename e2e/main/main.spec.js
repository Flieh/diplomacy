'use strict';

describe('Home page', function() {
  var page;

  beforeEach(function() {
    browser.get('/');
    //page = require('./main.po');
  });

  it('should pass', function() {
      expect(true).toBe(true);
  });
});
