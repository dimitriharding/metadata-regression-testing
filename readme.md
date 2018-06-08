![MRT - Metadata Regression Testing](https://raw.githubusercontent.com/dimitriharding/metadata-regression-testing/master/media/logo.png)

> Simple HTML Metadata Regression Testing Tool

[![Build Status](https://travis-ci.org/dimitriharding/metadata-regression-testing.svg?branch=master)](https://travis-ci.org/dimitriharding/metadata-regression-testing)
[![Coverage Status](https://coveralls.io/repos/github/dimitriharding/metadata-regression-testing/badge.svg?branch=master)](https://coveralls.io/github/dimitriharding/metadata-regression-testing?branch=master)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)


Useful for when you want to ensure that metadata remains the same for a certain page. 


## Install

```
$ npm install --save metadata-regression-testing
```

## Usage

```js
const { mrt } = require('metadata-regression-testing');
const opts = {};

/*
 * Use some async function
 */
(async () => {
    let isExpected;

    isExpected = await mrt(opts, 'https://github.com');
    console.log(isExpected);
    //=> true
    //   See ./tests/metadata-regression/expected/_homepage.json   

    opts.path = 'tests/updated';
    opts.keysOnly = true;
    
    isExpected = await mrt(opts, 'https://www.google.com','https://github.com');
    console.log(isExpected);
    //=> false 
    //   See ./tests/updated/diffs/www.google.com_VS_github.com_homepage.json
    //   Check console for differences between google and github metadata keys (example only)
})()
```

```js
const { mrt } = require('metadata-regression-testing');
const opts = {};

/*
 * Use .then method
 */
mrt(opts, 'https://github.com')
 .then(isExpected => {
    console.log(isExpected);
    //=> true
    //   See ./tests/metadata-regression/expected/_homepage.json
});

opts.path = 'tests/updated';
opts.keysOnly = true;

mrt(opts, 'https://www.google.com', 'https://github.com')
 .then(isExpected => {
    console.log(isExpected);
    //=> false
    //    See ./tests/updated/diffs/www.google.com_VS_github.com_homepage.json
    //   Check console for differences between google and github metadata keys (example only)
});
```

*Note*: Files are generated in the following folder structure vy default (override is possible).
```
project_folder
|_ tests/
    |_metadata-regression/
        |_actual/
        |   *.json
        |_diffs/
        |   *.json
        |_expected/
            *.json
```

## API
<a name="mrt"></a>

## mrt(opts, testUrl, [refUrl]) ⇒ <code>Boolean</code>
Scrapes given URL/s for HTML metadata and performs a regression test

**Returns**: <code>Boolean</code> - whether or not a match was found

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>Object</code> |  | JSON object with desired options |
| [opts.path] | <code>String</code> | <code>&#x27;tests/metadata-regression&#x27;</code> | If defined, data files will be stored at dir |
| [opts.keysOnly] | <code>Boolean</code> | <code>false</code> | If set to true, values will not be asserted |
| testUrl | <code>String</code> |  | Web page endpoint to scrape metadata from and test |
| [refUrl] | <code>String</code> |  | Web page endpoint to use as reference for the metadata |

## CLI
```console
$   mrt --help

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
```

## Tests

`npm test`

## Additional Info

This is not a test runner, it only returns a value that can be asserted within a test runner of your choice ([ava](https://github.com/avajs/ava), [mocha](https://github.com/mochajs/mocha), etc.). 

It automatically creates an expected JSON on the first run of any URL. These JSON files are named based on the URL path after the domain. A `_homepage` file is created from the homepage whether or not `/` is added to the domain. 

Review [html-metadata](https://github.com/wikimedia/html-metadata) to see what is being scrapped. 

## Good to Have
- [x] CLI feature
- [x] Option overrides (e.g. change default file paths)
- [x] Support multiple domains

### First Run Quick Look
![First Run Terminal Output](https://raw.githubusercontent.com/dimitriharding/metadata-regression-testing/master/media/first_run_mrt.png)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdimitriharding%2Fmetadata-regression-testing.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdimitriharding%2Fmetadata-regression-testing?ref=badge_shield)


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdimitriharding%2Fmetadata-regression-testing.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdimitriharding%2Fmetadata-regression-testing?ref=badge_large)