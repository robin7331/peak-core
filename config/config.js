var pjson = require('../package.json');

var config = {};

/**
 * Defines the Peak Core Name
 */
config.name = "peak-core";

/**
 * Defines if the debugging mode is turned on
 * @type {Boolean}
 */
config.debug = true;

/**
 * If set to true all method definitions will be logged on module installation.
 * @type {Boolean}
 */
config.debugMethodDefinitions = false;


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

/**
 * Default configuration for modules that do not have an own <<Module>>.config object
 */
config.defaultModuleConfig = {
    skipJSMethodValidationOnInstall : false,
    generateFunctionStubs : false
}


module.exports = config;
