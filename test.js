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
const diffFilePath = `${base}/diffs/_homepage.json.txt`;
const diffFilePathForDifferentDomains = `${base}/diffs/www.npmjs.com_VS_github.com_homepage.json.txt`;

/*
 * URLs
 */
const GITHUB_URL = 'https://github.com';
const GITHUB_URL_WITH_SLASH = 'https://github.com/';
const NPM_URL = 'https://www.npmjs.com';
const NPM_URL_WITH_SLASH = 'https://www.npmjs.com/';

/**
 * Remove files from tests folder
 */
const removeTestData = () => {
	rmdir(`${__dirname}/tests`, err => {
		if (err) {
			console.log(err);
		}
		console.log('All files were removed from ./tests');
	});
};

test('Should accept two urls and pass', async t => {
	removeTestData();
	// Running module
	const result = await mrt(NPM_URL, NPM_URL_WITH_SLASH);

	const expectedFilePathExists = fs.existsSync(expectedFilePath);
	const actualFilePathExists = fs.existsSync(actualFilePath);

	t.plan(3);

	// Relevant files are created
	t.true(expectedFilePathExists);
	t.true(actualFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should accept two urls and fail', async t => {
	removeTestData();
	// Running module
	const result = await mrt(NPM_URL, GITHUB_URL);

	const diffFilePathForDifferentDomainsExists = fs.existsSync(diffFilePathForDifferentDomains);

	t.plan(2);

	// Relevant files are created
	t.true(diffFilePathForDifferentDomainsExists);

	// Result from mrt is true
	t.false(result);
});

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
	await mrt(GITHUB_URL);
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
	t.is(error.message, 'Error: Unable to retrieve metadata - Please check URL 🤔');
});

test.after('cleanup', () => {
	removeTestData();
});

