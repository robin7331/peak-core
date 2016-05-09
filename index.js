var core = {};
module.exports = core;

var config = require('config');
var helpers = require('./lib/helpers');

bridge.Core = function (options) {

	config.nativeMethods.concat(options.methods.native);
	config.vueMethods.concat(options.methods.vue);

	return module;
};
