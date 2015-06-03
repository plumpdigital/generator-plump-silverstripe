//    Gulp utility.
var gulp    = require('gulp'),
	gutil   = require('gulp-util');

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
	sass         = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss    = require('gulp-minify-css'),
	imagemin     = require('gulp-imagemin'),
	newer        = require('gulp-newer'),
	insert       = require('gulp-insert'),
	livereload   = require('gulp-livereload'),
	ftp          = require('gulp-ftp');

//    Load external config.
var config = require('./gulp-config.json'),
	themeDirectory = config.themeDirectory;

//    Load command-line arguments.
var argv = require('yargs').argv;

/**
 *    Make error handling easier by outputting the error message
 *    directly in to the browser.
 *
 * 1. Use the already-built CSS file in the dev directory.
 * 2. Prepend content in to the CSS file. Use regex to remove
 *    and new lines & escape single quotes which would break the CSS.
 * 3. Write the file to the dev/css directory.
 */
var injectError = function(err) {

	// Log error as normal.
	console.log(err.message + ' on Line ' + err.line + ' , Column ' + err.column + '.');

	gulp.src('dev/css/style.css') /* [1] */
		.pipe(insert.prepend("body:before { content: '" + /* [2] */
			'Sass Build Error: ' + err.message.replace(/(\r\n|\n|\r)/gm," ").replace(/'/g, "\\'") +
			' on Line ' + err.line + ', Column ' + err.column + '.' + "'; color: red; font-weight: bold }"))
		.pipe(gulp.dest('dev/css')) /* [3] */
}

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

	var outputDirectory = themeDirectory + 'js/';

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
  * 2. Compile using SASS, expanded style.
  * 3. Auto-prefix (e.g. -moz-) using last 2 browser versions.
  * 4. Output prefixed but non-minifed CSS to dev/css
  * 5. Rename to .min.css
  * 6. Minify the CSS.
  * 7. Output prefixed, minified CSS to dist/css.
  */
 gulp.task('styles', function() {

 	var outputDirectory = themeDirectory + 'css/';

 	return gulp.src(config.files.styles) /* [1] */
 		.pipe(sass({  /* [2] */
 			style : 'expanded',
 			onError: injectError
 		}))
 		.pipe(autoprefixer('last 2 versions')) /* [3] */
 		.pipe(gulp.dest(outputDirectory))  /* [4] */
 		.pipe(rename({ suffix : '.min' })) /* [5] */
 		.pipe(minifycss()) /* [6] */
 		.pipe(gulp.dest(outputDirectory)); /* [7] */

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
 *    Clean task. Deletes theme assets.
 */
gulp.task('clean', function(callback) {
	// TODO reduce chaining if possible.
	return rimraf(themeDirectory + 'css/', function() {
		rimraf(themeDirectory + 'js/', function() {
			rimraf(themeDirectory + 'images/', callback);
		});
	});
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

	livereload.listen(LIVERELOAD_PORT); /* [2] */

	gulp.watch(themeDirectory + '/**/*').on('change', livereload.changed); /* [3] */

});

/**
 *    Build task. Runs other tasks that produce a built project
 *    in /dev and /dist.
 *
 * 1. Using runsequence to run clean first, separate to the build tasks. Passing
 *    the Gulp callback to runsequence so that the task can complete correctly.
 */
gulp.task('build', function(callback) {
	runsequence('clean', ['images', 'styles', 'scripts'], callback);
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
