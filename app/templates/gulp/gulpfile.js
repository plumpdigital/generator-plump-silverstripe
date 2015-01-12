//    Gulp utility.
var gulp    = require('gulp'),
	gutil   = require('gulp-util'),
	plumber = require('gulp-plumber');

//    Requires.
var express     = require('express'),
	open        = require('open'),
	rimraf      = require('rimraf'),
	merge       = require('merge-stream'),
	runsequence = require('run-sequence'),
	stylish     = require('jshint-stylish');

//    Plugin requires.
var concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	jshint       = require('gulp-jshint'),
	rename       = require('gulp-rename'),
	swig         = require('gulp-swig'),
	sass         = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss    = require('gulp-minify-css'),
	imagemin     = require('gulp-imagemin'),
	newer        = require('gulp-newer'),
	livereload   = require('gulp-livereload'),
	ftp          = require('gulp-ftp');

//    Load external config.
var config = require('./gulp-config.json'),
	themeDirectory = config.themeDirectory;

//    Load command-line arguments.
var argv = require('yargs').argv;

//    Error handler function.
var onError = function (err) {
	console.log(err);
};

/**
 *    Constants.
 */

var DIST_SERVER_PORT 	= 9001;
var DEV_SERVER_PORT 	= 9000;
var LIVERELOAD_PORT 	= 35729;

/**
 *    Script build task. Combines and uglifies JS, producing
 *    both a minified and non-minified version in dist/ and
 *    dev/ respectively.
 *
 * 1. Using all files defined in files.scripts config.
 * 2. Run JSHint and report the output.
 * 3. Combine into main.js
 * 4. Output development version.
 * 5. Rename to main.min.js
 * 6. Uglify to minify.
 * 7. Output minified version.
 */
gulp.task('scripts', function() {

	var outputDirectory = themeDirectory + 'scripts/';

	return gulp.src(config.files.scripts) /* [1] */
		.pipe(jshint()) /* [2] */
		.pipe(jshint.reporter(stylish))
		.pipe(concat('main.js')) /* [3] */
		.pipe(gulp.dest(outputDirectory)) /* [4] */
		.pipe(rename({ suffix : '.min' })) /* [5] */
		.pipe(uglify()) /* [6] */
		.pipe(gulp.dest(outputDirectory)); /* [7] */

});

/**
 *    Styles build task. Compiles CSS from SASS, auto-prefixes
 *    and outputs both a minified and non-minified version into
 *    dist/ and dev/ respectively.
 *
 * 1. Using all files defined in files.styles config.
 * 2. Catch any errors within the SASS build pipeline.
 * 3. Compile using SASS, expanded style.
 * 4. Auto-prefix (e.g. -moz-) using last 2 browser versions.
 * 5. Output prefixed but non-minifed CSS.
 * 6. Rename to .min.css
 * 7. Minify the CSS.
 * 8. Output prefixed, minified CSS.
 */

gulp.task('styles', function() {

	var outputDirectory = themeDirectory + 'styles/';

	return gulp.src(config.files.styles) /* [1] */
		.pipe(plumber(onError)) /* [2] */
		.pipe(sass({ style : 'expanded' })) /* [3] */
		.pipe(autoprefixer('last 2 versions')) /* [4] */
		.pipe(gulp.dest(outputDirectory)) /* [5] */
		.pipe(rename({ suffix : '.min' })) /* [6] */
		.pipe(minifycss()) /* [7] */
		.pipe(gulp.dest(outputDirectory)); /* [8] */

});

/**
 *    Image optimsation task.
 *
 * 1. Determine whether to use imagemin or do nothing (noop).
 * 2. Use files defined in files.images config.
 * 3. Filter to only images that are newer than in the destination.
 * 4. Output optimised images.
 */
gulp.task('images', function() {

	var outputDirectory = themeDirectory + 'images/';

	var imageminPipe = config.minifyImages ? imagemin({
		optimizationLevel : 3,
		progressive : true,
		interlaced : true
	}) : gutil.noop(); /* [1] */

	return gulp.src(config.files.images) /* [2] */
		.pipe(newer(outputDirectory)) /* [3] */
		.pipe(imageminPipe)
		.pipe(gulp.dest(outputDirectory)); /* [4] */

});

/**
 *    Copy task. Copies over any files that are not part of other tasks
 *    (e.g. HTML pages) to both /dev and /dist
 *    Clean task. Deletes the dev/ and dist/ directories.
 */
gulp.task('clean', function(callback) {
	// TODO reduce chaining if possible.
	return rimraf(themeDirectory + 'styles/', function() {
		rimraf(themeDirectory + 'scripts/', function() {
			rimraf(themeDirectory + 'images/', callback)
		})
	});
});

/**
 *    Copy task. Copies over any files that are not part of other tasks
 *    (e.g. HTML pages, JS libraries) to both /dev and /dist
 *
 * 1. Change the base path to avoid copying top-level directories.
 */
gulp.task('copy', function() {
	return gulp.src(config.files.copy, { base : config.copyBase }) /* [1] */
		.pipe(gulp.dest('dev'))
		.pipe(gulp.dest('dist'));
});

/**
 *    Watch task. Sets up several watchers. Using different config for styles and
 *    templates as they have partials that need watching but not compiling.
 *
 * 1. Any changes to any files from files.watchStyles config starts styles task.
 * 2. Any changes to any files from files.scripts config starts scripts task.
 * 3. Any changes to any files from files.images config starts images task.
 */
gulp.task('watch', function() {

	gulp.watch(config.files.watchStyles, ['styles']);	/* [1] */

	gulp.watch(config.files.scripts, ['scripts']); /* [2] */

	gulp.watch(config.files.images, ['images']); /* [3] */

});




/**
 *    Develop task. Sets up watches and serves up /dev using
 *    livereload.
 *
 * 1. Initial run of build and watch.
 * 2. LiveReload server listens on the port specified above.
 * 3. Inform the LiveReload server of any change in the theme directory.
 */
gulp.task('develop', ['build', 'watch'] /* [1] */, function() {

	var lr = livereload(LIVERELOAD_PORT); /* [2] */

	gulp.watch(themeDirectory + '/**/*').on('change', function(file) { /* [3] */
		lr.changed(file.path);
	});

});

/**
 *    Build task. Runs other tasks that produce a built project
 *    in /dev and /dist.
 *
 * 1. Using runsequence to run clean first, separate to the build tasks. Passing
 *    the Gulp callback to runsequence so that the task can complete correctly.
 */
gulp.task('build', function(callback) {
	runsequence('clean', ['images', 'styles', 'scripts', 'copy'], callback);
});

/**
 *    Default task. Lists out available tasks.
 */
gulp.task('default', function() {

	var cyan = gutil.colors.cyan,
		magenta = gutil.colors.magenta;

	gutil.log(magenta('----------'));
	gutil.log(magenta('Plump SilverStripe Theme Gulp'));

	gutil.log('The following tasks are available:');

	gutil.log(cyan('build') + ': builds the contents of src/ to the SilverStripe theme directory.');
	gutil.log(cyan('develop') + ': performs an initial build then sets up watches.');

	gutil.log(magenta('----------'));

});
