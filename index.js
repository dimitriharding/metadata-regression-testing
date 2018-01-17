'use strict';

const scrape = require('html-metadata');
const fs = require('fs-extra');
const diff = require('deep-diff').diff;
const jsonDiffString = require('json-diff').diffString;
const colors = require('colors/safe');

const bgRed = colors.bgRed;
const sillyMessage = colors.rainbow;
const infoMessage = colors.green;

const log = console.log;

const youHaveBeenBad = (msg, err) => {
	throw new Error(msg, err);
};

const createFilenameFromUrl = url => {
	let filename = url.replace(/^.*\/\/[^/]+/, '').replace(/[^\w\s]/gi, '_');
	if (filename === '' || filename === '_') {
		filename = '_homepage';
	}
	return filename;
};

const getMetadatDiff = (expected, actual) => {
	const expectedJSON = fs.readJsonSync(expected);
	const actualJSON = fs.readJsonSync(actual);
	const diffPath = expected.replace('/expected/', '/diffs/');
	const diffResults = jsonDiffString(actualJSON, expectedJSON);
	const differences = diff(actualJSON, expectedJSON);

	if (differences === undefined && diffResults === '') {
		log(sillyMessage(`\nRegression Testing was successful for: ${actual}`));
		return true;
	}
	// Log difference
	log(bgRed('\n ** Difference #1 Green = Expected | Red = Current **'));
	log(diffResults);

	log(bgRed('\n ** Difference #12 rhs = Expected | lhs = Current **'));
	log(differences);

    // Write difference to a file
	fs.outputFileSync(diffPath, diffResults);
	return false;
};

const generateMetaFiles = (url, metaData) => {
	const filename = createFilenameFromUrl(url);
	const metadataPath = 'tests/metadata-regression';
	const expectedMetaPath = `${metadataPath}/expected/${filename}.json`;
	const actualMetaPath = `${metadataPath}/actual/${filename}.json`;

    // Create actual metadata file with data
	fs.outputFileSync(actualMetaPath, JSON.stringify(metaData, null, '\t'));

    // Create new expected metadata json file if none exists
	if (!fs.existsSync(expectedMetaPath)) {
		log(infoMessage('UPDATING: Expected metadata JSON does NOT exist.'));
		log(infoMessage('Creating Expected metadata JSON from Result: ' + expectedMetaPath));

		try {
			fs.copySync(actualMetaPath, expectedMetaPath);
			log(infoMessage('Expected Metadata file created!'));
		} catch (err) /* istanbul ignore next */ {
			youHaveBeenBad('🤔 Something went wrong while copying metadata - Check actual folder', err);
		}
	}

	return getMetadatDiff(expectedMetaPath, actualMetaPath);
};

/**
 * Scrapes a given URL for metadata and performs a regression test
 * @param {string} url - Web page endpoint to scrape metadata from
 * @return {boolean}
 */
exports.mrt = url => {
	return scrape(url)
        .then(metadata => {
	return generateMetaFiles(url, metadata);
})
        .catch(err => {
	youHaveBeenBad('Unable to retrieve metadata - Please check URL 🧐', err);
});
};

