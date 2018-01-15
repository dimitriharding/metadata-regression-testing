# 🔄 metadata-regression-testing 🔄
> Simple Metadata Regression Testing Tool

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)


Useful for when you want to ensure that metadata remains the same for a certain page. 


## Install

```
$ npm install --save metadata-regression-testing
```

## Usage

```js
const { mrt } = require('metadata-regression-testing');

/*
 * Use some async function
 */
(async () => {
  let isExpected;

  isExpected = await mrt('https://github.com');
  console.log(isExpected);
  //=> true
  //   See ./tests/metadata-regression/expected/_homepage.js   

   isExpected = await mrt('https://github.com');
   console.log(isExpected);
  //=> true

  isExpected = await mrt('https://www.google.com');
  console.log(isExpected);
  //=> false 
  //   See ./tests/metadata-regression/diffs/_homepage.js 
  //   Check console for differences between google and github metadata (example only)
})()
```

```js
const { mrt } = require('metadata-regression-testing');

/*
 * Use .then method
 */
mrt('https://github.com')
 .then(isExpected => {
    console.log(isExpected);
    //=> true
    //   See ./tests/metadata-regression/expected/_homepage.js 
});

mrt('https://github.com')
 .then(isExpected => {
    console.log(isExpected);
    //=> true
});

mrt('https://www.google.com')
 .then(isExpected => {
    console.log(isExpected);
    //=> false
    //   See ./tests/metadata-regression/diffs/_homepage.js 
    //   Check console for differences between google and github metadata (example only)
});
```

## Tests

`npm test`

## Additional Info

This is not a test runner, it only returns a value that can be asserted within a test runner of your choice ([ava](https://github.com/avajs/ava), [mocha](https://github.com/mochajs/mocha), etc.). 

It automatically creates an expected JSON with on the first run of any URL. These JSON files are named based on the URL path after the domain. A `_homepage` file is created from the homepage whether or not `/` is added to the domain. 

Review [html-metadata](https://github.com/wikimedia/html-metadata) to see what is being scrapped. 

There are two sets of `differences` that are logged to the console once there is a mismatch. They are (another time I'll come up with better names): 
* :sparkler: colorful - Learn more @ [json-diff](https://github.com/andreyvit/json-diff)
* :page_facing_up: detailed  - Learn more @ [deep-diff](https://github.com/flitbit/diff)

## Good to Have
- [] CLI feature
- [] Option overrides (e.g. change default file paths)
- [] Custom names 
- [] Support multiple domains (currently, the assumption is that only one domain will be tested per usage)