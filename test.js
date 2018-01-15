import {test} from 'ava';

const fs = require('fs-extra');
const rmdir = require('rmdir');
const {mrt} = require('./index.js');

/*
 * PATHs
 */
const base = `${__dirname}/tests/metadata-regression`;
const expectedFilePath = `${base}/expected/_homepage.json`;
const actualFilePath = `${base}/actual/_homepage.json`;
const diffFilePath = `${base}/diffs/_homepage.json`;

/*
 * URLs
 */
const GITHUB_URL = 'https://github.com';
const GITHUB_URL_WITH_SLASH = 'https://github.com/';
const NPM_URL = 'https://www.npmjs.com';

test('First time: Should only generate expected and actual folders with JSON files and pass', async t => {
    // Running module
	const result = await mrt(GITHUB_URL);

	const expectedFilePathExists = fs.existsSync(expectedFilePath);
	const actualFilePathExists = fs.existsSync(actualFilePath);
	const diffFilePathExists = fs.existsSync(diffFilePath);

	t.plan(4);
	// Relevant files are created
	t.true(expectedFilePathExists);
	t.true(actualFilePathExists);
	t.false(diffFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should create _homepage filename for domain with "/" at the end as well and pass', async t => {
	// Running module
	const result = await mrt(GITHUB_URL_WITH_SLASH);

	const expectedFilePathExists = fs.existsSync(expectedFilePath);
	const actualFilePathExists = fs.existsSync(actualFilePath);

	t.plan(3);

	// Relevant files are created
	t.true(expectedFilePathExists);
	t.true(actualFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should create diff if current/actual metadata does not match baseline/expected metadata', async t => {
	// Running module
	const result = await mrt(NPM_URL);

	const diffFilePathExists = fs.existsSync(diffFilePath);

	t.plan(2);

	// Relevant files are created
	t.true(diffFilePathExists);

	// Result from mrt is false
	t.false(result);
});

test('Should throw error for invalid URL', async t => {
	const INVALID_URL = 'https$$myurl.com';
	const error = await t.throws(mrt(INVALID_URL));

	t.is(error.message, 'Unable to retrieve metadata - Please check URL 🧐');
});

test.after.always('cleanup', () => {
	rmdir(`${__dirname}/tests`, err => {
		if (err) {
			console.log(err);
		}
		console.log('Cleanup complete, all files were reoved');
	});
});

