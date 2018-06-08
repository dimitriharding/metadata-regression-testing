import {test} from 'ava';

const fs = require('fs');
const path = require('path');
const execa = require('execa');

const cliPath = path.join(__dirname, '../cli.js');
const {removeTestData} = require('./helpers/remove-test-data');
const {expectedFilePath, actualFilePath, updatedBase} = require('./helpers/paths');
const {WITH_SLASH_5000, WITHOUT_SLASH_5000, WITHOUT_SLASH_8080, AWESOME_URL, KINDA_AWESOME_URL} = require('./helpers/urls');

const DIFF_REGEX = /[\n-]+|[\n+a-]+/;
const run = args => execa(process.execPath, [
	cliPath, ...args
]);

test.before('Start Server', () => {
	require('./helpers/server');
});

test('Should accept inputs', t => {
	removeTestData();
	return run([WITH_SLASH_5000, WITHOUT_SLASH_5000]).then(({stdout}) => {
		const expectedFilePathExists = fs.existsSync(expectedFilePath);
		const actualFilePathExists = fs.existsSync(actualFilePath);

		// Relevant files are created
		t.false(expectedFilePathExists);
		t.false(actualFilePathExists);
		t.true(stdout.includes('SUCCESS  Regression Testing was successful for:'));
		t.true(stdout.includes('tests/metadata-regression/actual/127.0.0.1:5000_VS_127.0.0.1:5000_homepage.json'));
	});
});

test('Should show error for no input', async t => {
	removeTestData();
	const {message} = await t.throws(run([]));
	t.true(message.includes('ERROR'));
	t.true(message.includes('Please provide URL to test or use --help for usage'));
});

test('Should be able to use flag: [--keys-only]', t => {
	return run([AWESOME_URL, KINDA_AWESOME_URL, '--keys-only']).then(({stdout}) => {
		t.true(stdout.includes('SUCCESS  Regression Testing was successful for:'));
	});
});

test('Should be able to use flag alias: [-k]', t => {
	return run([AWESOME_URL, KINDA_AWESOME_URL, '-k']).then(({stdout}) => {
		t.true(stdout.includes('SUCCESS  Regression Testing was successful for:'));
	});
});

test('Should be able to use flag: [--path]', t => {
	return run([WITHOUT_SLASH_8080, '--path', updatedBase]).then(({stdout}) => {
		t.true(stdout.includes(updatedBase));
	});
});

test('Should be able to use flag alias: [-p]', t => {
	return run([AWESOME_URL, KINDA_AWESOME_URL, '-p', updatedBase]).then(({stdout}) => {
		t.true(stdout.includes(updatedBase));
		t.regex(stdout, DIFF_REGEX);
	});
});

test('Should be able to use flag: [--help]', t => {
	return run(['--help']).then(({stdout}) => {
		t.true(stdout.includes('$ mrt <testUrl> [refUrl]'));
		t.true(stdout.includes('$ mrt https://qa-mrtoverflow.com https://dev-mrtoverflow.com --keys-only'));
	});
});

test('Should be able to use flag: [--diff-board]', t => {
	removeTestData();
	return run([AWESOME_URL, '--diff-board']).then(({stdout}) => {
		t.true(stdout.includes('Report created:'));
	});
});

test('Should be able to use flag: [-b]', t => {
	removeTestData();
	return run([AWESOME_URL, '-b']).then(({stdout}) => {
		t.true(stdout.includes('Report created:'));
	});
});

test.after('cleanup', () => {
	removeTestData();
});
