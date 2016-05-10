var pjson = require('../package.json');

var config = {};

/**
 * Defines if the debugging mode is turned on
 * @type {Boolean}
 */
config.debug = true;

/**
 * Used as prefix for console outputs.
 * @param {String}
 */
config.consoleTag = "PEAK Core (" + pjson.version + ")";

/**
 * Method definitions for native methods.
 * @param  {array} An array of method definitions.
 */
config.nativeMethods = require('./required-native-methods');

/**
 * Method definitions for JS methods.
 * @param  {array} An array of method definitions.
 */
config.JSMethods = require('./required-js-methods');


module.exports = config;
