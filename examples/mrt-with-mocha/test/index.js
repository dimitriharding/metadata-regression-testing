const assert = require('assert');
const {mrt, diffboard} = require('metadata-regression-testing');
const options = {
		path: 'results',
		diffboardTitle: 'MRT with Mocha'
};
describe('MRT with Mocha', () => {
		it('Google is the same', (done) => {
				mrt(options, 'https://www.google.com').then(isExpected => {
						// This will fail eventually because google updates their metadata regularly.
						// Which will make this a true test overtime since the expected will be of today
						// July 8, 2018
						assert.equal(isExpected, true);
						done();
				});
		});

		it('Google and Github has diff', (done) => {
				mrt(options, 'https://www.google.com', 'https://github.com').then(isExpected => {
						assert.equal(isExpected, false);
						done();
				});
		});

		after(() => {
				// A report will be generated after all the tests are done Copy link from
				// console
				diffboard(options);
		});
});