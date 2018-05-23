'use strict';

const {diffString: jsonDiffString, diff} = require('json-diff');
const scrape = require('html-metadata');
const fs = require('fs-extra');
const chalk = require('chalk');
const log = require('xa');

const DOMAIN_REG = /:\/\/(.[^/]+)/;
const METADATA_PATH = 'tests/metadata-regression';
let options = {};

const youHaveBeenBad = (msg, err) => {
	throw new Error(msg, err);
};

const createFilenameFromUrl = url => {
	let filename = url
		.replace(/^.*\/\/[^/]+/, '')
		.replace(/[^\w\s]/gi, '_');
	const homepage = '_homepage';
	if (filename === '') {
		filename = homepage;
	}

	if (filename === '_') {
		filename = homepage;
	}

	return filename;
};

const compareMetaData = (testMetadata, referenceMetadata, diffPath) => {
	const diffResults = jsonDiffString(testMetadata, referenceMetadata, {}, options);

	if (diffResults === '') {
		log.info('SUCCESS', `Regression Testing was successful for: ${log.link(diffPath.replace('/diffs/', '/actual/'))}`);
		return true;
	}

	// Log difference
	log.warn('DIFFERENCE', `${chalk.green('Green = Expected')} | ${chalk.red('Red = Current')}`);
	console.info(diffResults);

	// Write difference to text file
	fs.outputFileSync(`${diffPath}`, JSON.stringify(diff(testMetadata, referenceMetadata, {
		raw: true,
		keysOnly: options.keysOnly
	}), null, 2));

	// Log path for results
	log.off('DIFF PATH', `${log.link(diffPath)}`);

	return false;
};

const getMetadatDiff = (expected, actual) => {
	const expectedJSON = fs.readJsonSync(expected);
	const actualJSON = fs.readJsonSync(actual);
	const diffPath = expected.replace('/expected/', '/diffs/');
	return compareMetaData(actualJSON, expectedJSON, diffPath);
};

const generateMetaFiles = fetchedMetadata => {
	const [TEST_URL,
		REF_URL] = Object.keys(fetchedMetadata);
	const filename = createFilenameFromUrl(TEST_URL);
	// Check for ref
	if (REF_URL !== undefined) {
		const [,
			testDomain] = TEST_URL.match(DOMAIN_REG);
		const [,
			refDomain] = REF_URL.match(DOMAIN_REG);
		const diffPath = `${options.path}/diffs/${testDomain}_VS_${refDomain}${filename}.json`;

		return compareMetaData(fetchedMetadata[TEST_URL], fetchedMetadata[REF_URL], diffPath);
	}
	const expectedMetaPath = `${options.path}/expected/${filename}.json`;
	const actualMetaPath = `${options.path}/actual/${filename}.json`;

	// Create actual metadata file with data
	fs.outputFileSync(actualMetaPath, JSON.stringify(fetchedMetadata[TEST_URL], null, '\t'));

	// Create new expected metadata json file if none exists
	if (!fs.existsSync(expectedMetaPath)) {
		log.off('MRT', 'Expected metadata JSON does NOT exist.');
		log.off('MRT', 'Creating Expected metadata JSON from Result: ' + log.link(expectedMetaPath));

		try {
			fs.copySync(actualMetaPath, expectedMetaPath);
			log.off('MRT', 'Expected Metadata file created!');
		} catch (err) {
			/* istanbul ignore next */
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
				reject(new Error(`Unable to retrieve metadata for ${urlToGetMetadataFrom} => ${err}`));
			});
	});
};

const setOptions = desiredOptions => {
	if (!(desiredOptions instanceof Object)) {
		youHaveBeenBad(`setOptions: options is expected to be an Object. Got ${typeof desiredOptions} - ${desiredOptions}`);
	}

	const defaultOptions = {
		path: METADATA_PATH,
		keysOnly: false
	};

	options = Object.assign(defaultOptions, desiredOptions);
};

/**
 * Scrapes given URL/s for HTML metadata and performs a regression test
 * @param {Object} opts - JSON object with desired options
 * @param {String} [opts.path='tests/metadata-regression'] - If defined, data files will be stored at dir
 * @param {Boolean} [opts.keysOnly=false] - If set to true, values will not be asserted
 * @param {String} testUrl - Web page endpoint to scrape metadata from and test
 * @param {String} [refUrl] - Web page endpoint to use as reference for the metadata
 * @return {Boolean} whether or not a match was found
 */
exports.mrt = (opts, ...urls) => {
	const urlPromises = urls.map(fetchMetadata);
	const metaDataResults = [];

	setOptions(opts);

	return Promise
		.all(urlPromises)
		.then(results => {
			results.forEach(metadata => {
				metaDataResults.push(metadata);
			});
			const urlkeyAndMetadataValuePairs = urls.reduce((obj, k, i) => Object.assign(obj, {[k]: metaDataResults[i]}), {});
			return generateMetaFiles(urlkeyAndMetadataValuePairs);
		})
		.catch(err => {
			youHaveBeenBad(err);
		});
};
