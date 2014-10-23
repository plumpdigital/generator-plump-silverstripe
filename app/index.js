'use strict';

var util      = require('util'),
	path      = require('path'),
	generator = require('yeoman-generator'),
	chalk     = require('chalk');

/**
 *    Plump SilverStripe Composer modules.
 *
 *    Prepended with plumpss- before being added as dependencies to composer.json
 */
var plumpSilversStripeModules = [

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

	// Tools
	'mixins',

	// Objects
	'band',
	'band-responsive',
	'exhibit',
	'meter',
	'nav-list',
	'stack',
	'wrapper',

	// Trumps
	'floats',
	'hide',
	'text-align'
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

	_config : {},

	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			this.log(
				chalk.magenta.bold('I\'m all done. You now need to run ') +
				chalk.green.bold('composer install') +
				chalk.magenta.bold(', ') +
				chalk.green.bold('npm install') +
				chalk.magenta.bold(' & ') +
				chalk.green.bold('bower install')
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
			type : 'input',
			name : 'themeName',
			message : 'What do you want the theme to be called?'
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
			this._config = props;
			done();
		}.bind(this));

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
	}

});
