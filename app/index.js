'use strict';

var util      = require('util'),
	path      = require('path'),
	generator = require('yeoman-generator'),
	chalk     = require('chalk');

/**
 *    Plump SilverStripe Composer modules.
 *
 *    Prepended with plumpss/ before being added as dependencies to composer.json
 */
var plumpSilverStripeModules = [
	'documents',
	'menus',
	'news'
];

/**
 *    Bower Inuit package options (prepended with inuitcss-).
 *    Organise alphabetically within Shearing layer category.
 */
var inuitCssModules = [

	// Settings
	'defaults',
	'responsive-settings',

	// Tools
	'functions',
	'mixins',
	'responsive-tools',
	'widths',

	// Generic
	'box-sizing',
	'normalize',
	'reset',
	'shared',

	// Base
	'headings',
	'images',
	'lists',
	'page',
	'paragraphs',

	// Object
	'box',
	'buttons',
	'flag',
	'layout',
	'list-bare',
	'list-block',
	'list-inline',
	'list-ui',
	'media',
	'pack',
	'tables',
	'tabs',

	// Trumps
	'clearfix',
	'headings-trumps',
	'print',
	'spacing',
	'spacing-responsive',
	'widths',
	'widths-responsive'
];

/**
 *    Bower Plump CSS package options (prepended with plumpcss-).
 *    Organise alphabetically within shearing layer category.
 */
var plumpCssModules = [

	// Settings
	'defaults',
	'responsive-settings',

	// Tools
	'functions',
	'mixins',

	// Objects
	'band',
	'exhibit',
	'meter',
	'stack',
	'widescreen-frame',
	'wrapper',

	// Trumps
	'floats',
	'responsive-floats',
	'hide',
	'responsive-hide',
	'text-align',
	'responsive-text-align'
];

/**
 *    Bower Plump JS package options (prepended with plumpjs-).
 *    Organise alphabetically within shearing layer category.
 */
var plumpJsModules = [
	'burger-menu',
	'google-map',
	'sticky-header',
	'svg-fallback',
	'tabs'
];

/**
 *    Yeoman generator class. Each method (not starting with _) is
 *    executed in source order.
 */
module.exports = generator.Base.extend({

	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			this.log(
				chalk.magenta.bold('I\'m all done. You now need to run ') +
				chalk.green.bold('composer install') +
				chalk.magenta.bold(' in build/ and ') +
				chalk.green.bold('npm install && bower install') +
				chalk.magenta.bold(' in src/')
			);
		});
	},

	/**
	 *    Prompts for project configuration.
	 *
	 * 1. Create asynchronous callback to pause execution
	 *    until all the prompts are completed.
	 */
	askFor: function () {
		var done = this.async(); // [1]

		// Have Yeoman greet the user.
		this.log(this.yeoman);
		this.log(chalk.magenta('You\'re using the Plump SilverStripe generator v' + this.pkg.version));

		var prompts = [{
			type : 'checkbox',
			name : 'plumpSilverStripeModules',
			message : 'Which Plump SilverStripe modules do you require?',
			choices : this._getModuleChoices(plumpSilverStripeModules, false)
		},
		{
			type : 'input',
			name : 'themeName',
			message : 'What do you want the theme to be called?',
			filter : this._filterLowercase
		},{
			type : 'checkbox',
			name : 'inuitCssModules',
			message : 'Which Inuit CSS modules do you require?',
			choices : this._getModuleChoices(inuitCssModules, true)
		},{
			type : 'checkbox',
			name : 'plumpCssModules',
			message : 'Which PlumpCSS modules do you require?',
			choices : this._getModuleChoices(plumpCssModules, true)
		}, {
			type : 'checkbox',
			name : 'plumpJsModules',
			message : 'Which PlumpJS modules do you require?',
			choices : this._getModuleChoices(plumpJsModules, false)
		}];

		this.prompt(prompts, function (props) {
			this.config = props;
			done();
		}.bind(this));

	},

	silverstripeSetup: function() {
		this.log(chalk.green('Just setting up SilverStripe.'));

		// Duplicate skeleton site and theme.
		this.directory('build', 'build');
		this.directory('theme', 'build/themes/' + this.config.themeName);

		// Create extra empty directories.
		this.mkdir('build/assets/Uploads');

		// Create composer config.
		this.template('_composer.json', 'build/composer.json');

		// Create SilverStripe configuration.
		this.copy('_ss_environment.php', '_ss_environment.php');
		this.template('_config.yml', 'build/mysite/_config/config.yml');
		this.template('_config.php', 'build/mysite/_config.php');

	},

	environmentSetup: function() {
		this.log(chalk.green('Setting up the Vagrant development environment.'));

		this.directory('environment', 'environment');
		this.copy('Vagrantfile', 'Vagrantfile');
	},

	toolsSetup: function() {
		this.log(chalk.green('Setting up additional tools.'));

		this.directory('test-data', 'test-data');
		this.copy('dbdump', 'dbdump');
		this.copy('dbrebuild', 'dbrebuild');
	},

	frontEndSetup: function() {
		this.log(chalk.green('Now setting up the front end.'));

		// Duplicate skeleton src directory.
		this.directory('src', 'src');

		// Template the NPM and Bower config for the UI
		this.template('_package.json', 'package.json');
		this.template('_bower.json', 'bower.json');

		// Template other configuration.
		this.template('_gitignore', '.gitignore');

		// Copy Gulpfile and template Gulp config.
		this.copy('gulp/gulpfile.js', 'gulpfile.js');
		this.template('gulp/_gulp-config.json', 'gulp-config.json');

	},

	/**
	 *    Helper to create a choices array for checkbox prompts.
	 */
	_getModuleChoices: function(modules, autoCheck) {
		var choices = [];
		for (var i = 0; i < modules.length; i++) {
			choices[i] = {
				name    : modules[i],
				checked : autoCheck
			};
		}
		return choices;
	},

	_filterLowercase: function(str) {
		return str.toLowerCase();
	}

});
