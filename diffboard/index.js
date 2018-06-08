const fs = require('fs');
const {join, extname, resolve} = require('path');

const fsExtra = require('fs-extra');
const chalk = require('chalk');

const {readdirSync, statSync, writeFileSync, readFileSync, existsSync} = fs;

const pug = require('pug');
const moment = require('moment');

class Diffboard {
	constructor(options) {
		this._fileName = options.fileName || 'diffboard';
		this._diffboardTitle = options.diffboardTitle || 'Diffboard';
		this._path = options.path;
		this._absolutePath = resolve(this._path);
		this._out = `${this._absolutePath}/diffboard`;
		this._template = resolve(__dirname, 'index.pug');
		this._data = resolve(this._out, `${this._fileName}.json`);
		this._public = resolve(__dirname, 'public');
	}

	/**
		* Find all files inside a dir, recursively.
		* @function getAllFiles
		* @param  {String} dir Dir path string.
		* @return {string[]} Array with all file names that are inside the directory.
		*/
	getAllFiles(dir) {
		const _dir = dir || this._absolutePath;
		return readdirSync(_dir).reduce((files, file) => {
			const name = join(_dir, file);
			const isDirectory = statSync(name).isDirectory();
			return isDirectory ?
				[
					...files,
					...this.getAllFiles(name)
				] :
				extname(name) === '.json' && name.includes('/expected/') ?
					[
						...files,
						name
					] :
					[...files];
		}, []);
	}

	/**
	 * Creates expected JSON to use with the diffboard template
	 * @param {String} testFolder
	 */
	createReportJson(testFolder) {
		const expectedFilePaths = this.getAllFiles(testFolder);
		const arrOfObjects = [];
		const stats = {
			all: 0,
			pass: 0,
			fail: 0
		};
		stats.all = expectedFilePaths.length;
		for (const expectedFileName of expectedFilePaths) {
			const actualFileName = expectedFileName.replace('/expected/', '/actual/');
			const diffFileName = `${actualFileName.replace('/actual/', '/diffs/')}.txt`;
			const diffPresent = existsSync(diffFileName);

			if (diffPresent) {
				stats.fail++;
			} else {
				stats.pass++;
			}

			arrOfObjects.push({
				id: expectedFileName
					.replace(this._absolutePath, '')
					.replace('/expected/', ''),
				expectedJson: require(expectedFileName),
				actualJson: require(actualFileName),
				diffText: diffPresent ?
					readFileSync(resolve(diffFileName), 'utf8') :
					null,
				statOfActualMTime: moment(statSync(actualFileName).mtime).format('YYYY-MM-DD HH:mm:ss')
			});
		}

		arrOfObjects.sort((a, b) => {
			const c = new Date(a.statOfActualMTime);
			const d = new Date(b.statOfActualMTime);
			return d - c;
		});

		writeFileSync(this._data, JSON.stringify({mrtData: arrOfObjects, stats}));
	}

	copyPublicFolder() {
		fsExtra.copySync(this._public, `${this._out}/public`);
		fsExtra.copySync(`${this._public}/fonts`, `${this._out}/public/fonts`);
		fsExtra.copySync(`${this._public}/img`, `${this._out}/public/img`);
	}

	generateHtml(diffboardTitle) {
		this.copyPublicFolder();
		this.createReportJson();

		const data = require(this._data);
		const bundles = require(resolve(__dirname, 'bundle.result.json'));

		data.diffBoardName = diffboardTitle || this._diffboardTitle;
		data.cache = true;
		data.bundle = bundles;

		const html = pug.renderFile(this._template, data);
		fs.writeFile(resolve(this._out, `${this._fileName}.html`), html, err => {
			/* istanbul ignore next */
			if (err) {
				console.log(err);
				return;
			}
			const reportPath = `${resolve(this._out, `${this._fileName}.html`)}`;
			console.log(chalk`{bgGreenBright {black.bold  DIFFBOARD }} {green Report created: } - {cyan ${reportPath} }`);
		});
	}
}
module.exports = Diffboard;
