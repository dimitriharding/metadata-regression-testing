/*
 * PATHs
 */
const path = require('path');

const updatedBase = `${path.join(__dirname, '../../tests/updated')}`;
const base = `${path.join(__dirname, '../../tests/metadata-regression')}`;
exports.base = base;
exports.updatedBase = updatedBase;
exports.expectedFilePath = `${base}/expected/_homepage.json`;
exports.updatedExpectedFilePath = `${updatedBase}/expected/_homepage.json`;
exports.actualFilePath = `${base}/actual/_homepage.json`;
exports.updatedActualFilePath = `${updatedBase}/actual/_homepage.json`;
exports.updatedDiffFilePath = `${updatedBase}/diffs/github.com_VS_www.google.com_homepage.json`;
exports.diffFilePath = `${base}/diffs/_homepage.json`;
exports.diffFilePathForDifferentDomains = `${base}/diffs/www.google.com_VS_github.com_homepage.json`;
