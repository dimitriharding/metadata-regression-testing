import {test} from 'ava';

const fs = require('fs-extra');
const rmdir = require('rmdir');
const {mrt} = require('.');

/*
 * PATHs
 */
const base = `${__dirname}/tests/metadata-regression`;
const updatedBase = `${__dirname}/tests/updated`;
const expectedFilePath = `${base}/expected/_homepage.json`;
const updatedExpectedFilePath = `${updatedBase}/expected/_homepage.json`;
const actualFilePath = `${base}/actual/_homepage.json`;
const updatedActualFilePath = `${updatedBase}/actual/_homepage.json`;
const updatedDiffFilePath = `${updatedBase}/diffs/github.com_VS_www.google.com_homepage.json`;
const diffFilePath = `${base}/diffs/_homepage.json`;
const diffFilePathForDifferentDomains = `${base}/diffs/www.google.com_VS_github.com_homepage.json`;

/*
 * URLs
 */
const GITHUB_URL = 'https://github.com';
const GITHUB_URL_WITH_SLASH = 'https://github.com/';
const GOOGLE_URL = 'https://www.google.com';
const GOOGLE_URL_WITH_SLASH = 'https://www.google.com/';
const opt = {};

/**
 * Remove files from tests folder
 */
const removeTestData = () => {
	const testFolders = [`${__dirname}/tests/metadata-regression`, `${__dirname}/tests/updated`];
	testFolders.forEach(folder => {
		if (fs.existsSync(folder)) {
			rmdir(folder, err => {
				if (err) {
					console.log(err);
				}
			});
		}
	});
};

test('Should accept two urls and pass', async t => {
	removeTestData();
	// Running module
	const result = await mrt(opt, GOOGLE_URL, GOOGLE_URL_WITH_SLASH);

	const expectedFilePathExists = fs.existsSync(expectedFilePath);
	const actualFilePathExists = fs.existsSync(actualFilePath);

	t.plan(3);

	// Relevant files are created
	t.false(expectedFilePathExists);
	t.false(actualFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should accept two urls and fail', async t => {
	removeTestData();
	// Running module
	const result = await mrt(opt, GOOGLE_URL, GITHUB_URL);

	const diffFilePathForDifferentDomainsExists = fs.existsSync(diffFilePathForDifferentDomains);

	t.plan(2);

	// Relevant files are created
	t.true(diffFilePathForDifferentDomainsExists);

	// Result from mrt is true
	t.false(result);
});

test('First time: Should only generate expected and actual folders with JSON files and' +
								' pass',
async t => {
	removeTestData();
	// Running module
	const result = await mrt(opt, GITHUB_URL);

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
	const result = await mrt(opt, GITHUB_URL_WITH_SLASH);

	const expectedFilePathExists = fs.existsSync(expectedFilePath);
	const actualFilePathExists = fs.existsSync(actualFilePath);

	t.plan(3);

	// Relevant files are created
	t.true(expectedFilePathExists);
	t.true(actualFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should create diff if current/actual metadata does not match baseline/expected m' +
								'etadata',
async t => {
	// Running module
	await mrt(opt, GITHUB_URL);
	const result = await mrt(opt, GOOGLE_URL);

	const diffFilePathExists = fs.existsSync(diffFilePath);

	t.plan(2);

	// Relevant files are created
	t.true(diffFilePathExists);

	// Result from mrt is false
	t.false(result);
});

test('Should throw error for invalid URL', async t => {
	const INVALID_URL = 'https$$myurl.com';
	const error = await t.throws(mrt(opt, INVALID_URL));
	t.is(error.message, 'Error: Unable to retrieve metadata for https$$myurl.com => HTTPError: 504: inter' +
												'nal_http_error');
});

test('Should throw error for missing options object', async t => {
	const error = t.throws(() => {
		mrt(GITHUB_URL);
	});
	t.is(error.message, 'setOptions: options is expected to be an Object. Got string - https://github.com');
});

test('Should use defined path for saving results', async t => {
	removeTestData();

	const result = await mrt({
		path: 'tests/updated'
	}, GITHUB_URL);

	const expectedFilePathExists = fs.existsSync(updatedExpectedFilePath);
	const actualFilePathExists = fs.existsSync(updatedActualFilePath);

	t.plan(3);

	// Relevant files are created
	t.true(expectedFilePathExists);
	t.true(actualFilePathExists);

	// Result from mrt is true
	t.true(result);
});

test('Should use keys only for asserting results', async t => {
	removeTestData();

	const result = await mrt({
		path: 'tests/updated',
		keysOnly: true
	}, GITHUB_URL, GOOGLE_URL);

	const expectedFilePathExists = fs.existsSync(updatedExpectedFilePath);
	const actualFilePathExists = fs.existsSync(updatedActualFilePath);
	const diffFilePathExists = fs.existsSync(updatedDiffFilePath);

	t.plan(4);

	// Relevant files are created
	t.false(expectedFilePathExists);
	t.false(actualFilePathExists);
	t.true(diffFilePathExists);
	// Result from mrt is true
	t.false(result);
});

test.after('cleanup', () => {
	removeTestData();
});
