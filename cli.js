#!/usr/bin/env node

'use strict';
const log = require('xa');
const meow = require('meow');
const {mrt} = require('.');

const cli = meow(`
	Usage
	  $ mrt <testUrl> [refUrl]

	Options
	  --keys-only, -k   Only compare keys in metadata object
	  --diff-board, -b  Generates an HTML report to view results
	  --path, -p        Defines where the data/results should be stored


	Examples
	  $ mrt https://mrtoverflow.com
	  
	  $ mrt https://mrtoverflow.com --keys-only
      
	  $ mrt https://qa-mrtoverflow.com https://dev-mrtoverflow.com
	  
	  $ mrt https://qa-mrtoverflow.com https://dev-mrtoverflow.com --keys-only
`, {
	flags: {
		keysOnly: {
			type: 'boolean',
			alias: 'k',
			defualt: false
		},
		path: {
			type: 'String',
			alias: 'p',
			default: null
		},
		diffBoard: {
			type: 'boolean',
			alias: 'b',
			defualt: false
		}
	}
});

const options = {};
const {path, keysOnly} = cli.flags;
if (path) {
	options.path = path;
}
if (keysOnly) {
	options.keysOnly = keysOnly;
}
if (cli.input.length === 0) {
	log.error('Please provide URL to test or use --help for usage.', {silent: true});
}

mrt(options, ...cli.input);
