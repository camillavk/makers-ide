process.env.NODE_ENV = 'test';
var server = require('../../server');
var expect = require('expect.js')
var Browser = require('zombie');
var fs = require('fs');

describe('errors', function() {
  var browser;

  before(function() {
    this.server = server.listen(3000);
    // initialize the browser using the same port as the test application
    browser = new Browser({ site: 'http://localhost:3000' });
    // fs.writeFile('code/_test.txt', 'Lorem ipsum');
    fs.unlinkSync('code/example.js')
  });


  before(function(done) {
    browser.visit('/', done);
  });

  after(function() {
    fs.writeFile('code/example.js', 'Put code here');
  });


    it('should show an error message if file not found', function() {
    expect(browser.text('.files')).to.contain('No files found')
  });
  
 });