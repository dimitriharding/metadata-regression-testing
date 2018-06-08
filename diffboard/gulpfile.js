const fs = require('fs');
const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();

const {reload} = browserSync;
const rimraf = require('gulp-rimraf');
const bundle = require('gulp-bundle-assets');

const data = require('gulp-data');

const fonts = ['./src/css/fonts/*'];

gulp.task('clean', () => {
	return gulp
		.src('./public', {read: false})
		.pipe(rimraf());
});

gulp.task('copy-fonts', ['clean'], () => {
	return gulp
		.src(fonts)
		.pipe(gulp.dest('./public/fonts'));
});

gulp.task('copy-img', ['copy-fonts'], () => {
	return gulp
		.src('./src/css/img/*')
		.pipe(gulp.dest('./public/img'));
});

gulp.task('bundle', ['copy-img'], () => {
	return gulp
		.src('./bundle.config.js')
		.pipe(bundle())
		.pipe(bundle.results({dest: './', pathPrefix: './public/'}))
		.pipe(gulp.dest('./public'));
});

gulp.task('build-report', ['bundle'], () => {
	return gulp
		.src('*.pug')
		.pipe(data(() => {
			return JSON.parse(fs.readFileSync('./data.json'));
		}))
		.pipe(pug({
			pretty: true,
			locals: {
				diffBoardName: 'DEV ENV',
				bundle: require('./bundle.result.json')
			}
		}))
		.pipe(gulp.dest('./'));
});

// Static server
gulp.task('serve', ['build-report'], () => {
	browserSync.init({server: './'});
	gulp.watch('*.pug', ['build-report']);
	gulp
		.watch('*.html')
		.on('change', reload);
	gulp
		.watch('./src/css/*.css')
		.on('change', reload);
	gulp
		.watch('./src/js/*.js')
		.on('change', reload);
});

gulp.task('default', ['serve']);
