/**
 * Remove files from tests folder
 */
const fs = require('fs');
const rmdir = require('rmdir');
const {base, updatedBase} = require('./paths');

exports.removeTestData = () => {
	const testFolders = [base, updatedBase];
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
