'use strict';

const scrape = require('html-metadata');
const fs = require('fs-extra');
const diff = require('deep-diff').diff;
const jsonDiffString = require('json-diff').diffString;
const colors = require('colors/safe');

const bgRed = colors.bgRed;
const sillyMessage = colors.rainbow;
const infoMessage = colors.green;
const DOMAIN_REG = /:\/\/(.[^/]+)/;
const METADATA_PATH = 'tests/metadata-regression';

const log = console.log;

const youHaveBeenBad = (msg, err) => {
	throw new Error(msg, err);
};

const createFilenameFromUrl = url => {
	let filename = url.replace(/^.*\/\/[^/]+/, '').replace(/[^\w\s]/gi, '_');
	if (filename === '') {
		filename = '_homepage';
	}

	if (filename === '_') {
		filename = '_homepage';
	}

	return filename;
};

const compareMetaData = (testMetadata, referenceMetadata, diffPath) => {
	const diffResults = jsonDiffString(testMetadata, referenceMetadata);
	const differences = diff(testMetadata, referenceMetadata);

	if (differences === undefined && diffResults === '') {
		log(sillyMessage(`Regression Testing was successful for: ${diffPath.replace('/diffs/', '/actual/')}`));
		return true;
	}

	// Log difference
	log(bgRed('\n ** Difference #1 Green = Expected | Red = Current **'));
	log(diffResults);

	log(bgRed('\n ** Difference #12 rhs = Expected | lhs = Current **'));
	log(JSON.stringify(differences, null, ' '));

	// Write difference to text file and remove ascii codes
	fs.outputFileSync(`${diffPath}.txt`, diffResults.replace(/\[31m|\[39m|\[32m|/g, ''));

	// Log path for results
	log(`See: ${diffPath}`);

	return false;
};

const getMetadatDiff = (expected, actual) => {
	const expectedJSON = fs.readJsonSync(expected);
	const actualJSON = fs.readJsonSync(actual);
	const diffPath = expected.replace('/expected/', '/diffs/');
	return compareMetaData(actualJSON, expectedJSON, diffPath);
};

const generateMetaFiles = fetchedMetadata => {
	const [TEST_URL, REF_URL] = Object.keys(fetchedMetadata);
	const filename = createFilenameFromUrl(TEST_URL);
	// Check for ref
	if (REF_URL !== undefined) {
		const testDomain = TEST_URL.match(DOMAIN_REG)[1];
		const refDomain = REF_URL.match(DOMAIN_REG)[1];
		const diffPath = `${METADATA_PATH}/diffs/${testDomain}_VS_${refDomain}${filename}.json`;

		return compareMetaData(fetchedMetadata[TEST_URL], fetchedMetadata[REF_URL], diffPath);
	}
	const expectedMetaPath = `${METADATA_PATH}/expected/${filename}.json`;
	const actualMetaPath = `${METADATA_PATH}/actual/${filename}.json`;

	// Create actual metadata file with data
	fs.outputFileSync(actualMetaPath, JSON.stringify(fetchedMetadata[TEST_URL], null, '\t'));

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

const fetchMetadata = urlToGetMetadataFrom => {
	return new Promise((resolve, reject) => {
		scrape(urlToGetMetadataFrom)
			.then(metadata => resolve(metadata))
			.catch(err => {
				log(JSON.stringify(err, null, ' '));
				reject(new Error('Unable to retrieve metadata - Please check URL 🤔', err));
			});
	});
};

/**
 * Scrapes a given URL/s for metadata and performs a regression test
 * @param {String} testUrl - Web page endpoint/s to scrape metadata from and test
 * @param {String} [refUrl] - Web page endpoint to use as reference for the metadata
 * @return {boolean}
 */
exports.mrt = (...urls) => {
	const urlPromises = urls.map(fetchMetadata);
	const metaDataResults = [];

	return Promise.all(urlPromises)
		.then(results => {
			results.forEach(metadata => {
				metaDataResults.push(metadata);
			});
			const urlkeyAndMetadataValuePairs = urls.reduce((obj, k, i) => ({...obj, [k]: metaDataResults[i]}), {});
			return generateMetaFiles(urlkeyAndMetadataValuePairs);
		})
		.catch(err => {
			youHaveBeenBad(err);
		});
};

