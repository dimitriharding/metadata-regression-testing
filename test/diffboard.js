import {test} from 'ava';

const fs = require('fs');
const {removeTestData} = require('./helpers/remove-test-data');
const {diffboardPath} = require('./helpers/paths');
const {AWESOME_URL, KINDA_AWESOME_URL, GITHUB_URL, GOOGLE_URL} = require('./helpers/urls');

const {mrt, diffboard} = require('..');

test.before('Start Server', () => {
	require('./helpers/server');
});

test('Should generate diffboard', async t => {
	removeTestData();
	await mrt({}, AWESOME_URL);
	await mrt({}, KINDA_AWESOME_URL);
	await mrt({}, GITHUB_URL);
	await mrt({}, GOOGLE_URL);
	diffboard();

	const diffboardPathExist = fs.existsSync(diffboardPath);
	t.true(diffboardPathExist);
});
