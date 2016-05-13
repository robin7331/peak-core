"use strict";

var config = require('../config/config');
var helpers = require('./helpers');
var Logger = require('./logger');
var PrivateHelpers = require('./private-helpers');

// private vars
var publishedJSFunctions = {};
var nativeCallbackFunctions = {};
var privateHelpers;
var installedModules = {};

/**
 * The PeakCore class is used to communicate between a JS context and a native iOS or Android app.
 * @param {array} nativeMethods Method definitions for all methods, that will be implemented on the native side.
 * @param {array} vueMethods    Method definitions for all methods, that will be implemented on the JS side.
 * @return {PeakCore}      PeakCore instance
 */
var Core = function PeakCore(nativeMethods, JSMethods) {

	// initialize the private helpers
	privateHelpers = new PrivateHelpers(this, {
		publishedJSFunctions: publishedJSFunctions,
		nativeCallbackFunctions: nativeCallbackFunctions
	});

	/**
	 * The configuration object
	 * @type {object}
	 */
	this.config = config;

	/**
	 * Helpers object
	 * @type {object}
	 */
	this.helpers = helpers;

	/**
	 * A Logger instance for logging messages to the native console
	 * @type {Logger}
	 */
	this.logger = new Logger(this);

	/**
	 * Convenient method to log an info message.
	 * @type {Function}
	 */
	this.info = this.logger.info.bind(this.logger);

	/**
	 * Convenient method to log an error message.
	 * @type {Function}
	 */
	this.error = this.logger.error.bind(this.logger);

	// merge all methods given through the constructor with the builtin methods.
	this.config.nativeMethods = this.config.nativeMethods.concat(nativeMethods);
	this.config.JSMethods = this.config.JSMethods.concat(JSMethods);

	// initialize the property that holds installed peak modules.
	this.modules = {};

}

/**
 * Makes this PeakCore instance available in the window.
 */
Core.prototype.makeGlobal = function() {
   window.peak = this;
}

/**
 * Registeres a PeakModule with this PeakCore instance.
 * @param  {Object} ModuleClass The module class to be instantiated and registered
 * @return {Object}             An instance of the given module.
 */
Core.prototype.installPeakModule = function(ModuleClass) {

	if (ModuleClass === undefined) {
		this.error("Cannot install undefined PeakModule");
		return;
	}

	var module = new ModuleClass(this);

	if (module.packageJSON === undefined) {
		this.error("Module has no packageJSON property defined!");
		return;
	}

	var packageJSON = module.packageJSON;

	// get the plain module name without "@bitmechanics/". F.ex. "peak-core" instead of "@bitmechanics/peak-core"
	var moduleName = packageJSON.name.replace("@bitmechanics/", "");

	//convert came to camelCase.
	var moduleNameCamelCase = privateHelpers.toCamelCase(moduleName);

	if (moduleNameCamelCase in this.modules) {
		this.info("Module " + moduleName + " was installed already!");
		return this.modules[moduleNameCamelCase];
	}

	if (module.nativeMethods === undefined) {
		this.error("Module " + moduleName + " has no nativeMethods property!");
		return;
	}

	if (module.JSMethods === undefined) {
		this.error("Module " + moduleName + " has no JSMethods property!");
		return;
	}

	// add the module method definitions to the config object
	this.config.nativeMethods = this.config.nativeMethods.concat(module.nativeMethods);
	this.config.JSMethods = this.config.JSMethods.concat(module.JSMethods);

	var infoMsg = "Module " + moduleName + " with version " + packageJSON.version + " was installed";
	
	this.info(infoMsg);

	this.modules[moduleNameCamelCase] = module
	return module;
}

/**
 * callJS is used by the native side to call a method in JS.
 * @param  {string} functionName   Name of the JS function.
 * @param  {any} payload           Payload to deliver to the function.
 * @param  {string} nativeCallback Function name of the native callback. (Only required on Android)
 */
Core.prototype.callJS = function(functionName, payload, nativeCallback) {

	if (this.config.debug) {
		this.info("JS function " + functionName + " called.");
	}

	//Get JS method definition
	var JSMethodDefinition = privateHelpers.getJSMethodDefinition(functionName);

	// is method defined in config?
	if (JSMethodDefinition === undefined) {
		this.error(functionName + "() is not implemented in JavaScript Code!");
		return;
	}

	// is payload type correct? (payload types for functions are defined in the config object)
	if (privateHelpers.isNativeMethodPayloadValid(JSMethodDefinition, payload) == false) {
		return;
	}


	//Check if this function was published
	if (functionName in publishedJSFunctions){
		var callbackData = publishedJSFunctions[functionName](payload);

		if (privateHelpers.isCallbackDataValidForMethodDefinition(JSMethodDefinition.callback, callbackData) == false) {
			this.error(functionName + "() callback data does not match definition!");
			return;
		}

		if(callbackData !== undefined){
			if (this.helpers.isiOS()) {
				return callbackData;
			} else {
				if(this.config.debug){
					this.info("Android Native Callback " + nativeCallback +"() called. With data: " + JSON.stringify(callbackData,null,4));
				}

				// execute the native call
				//Set universal callback name in Android
				JSMethodDefinition.callback.name = "invokeNativeCallback";
				privateHelpers.execNativeCall("local", JSMethodDefinition.callback, callbackData, callbackKey);
			}

		}

	}
	else{
		this.error(functionName + "() is not implemented in JavaScript! (not published?)");
	}
}

/**
 * This function is used by the native side to invoce a callback function.
 * @param  {string} callbackFunctionName The function name of the callback
 * @param  {any} jsonData     Payload of the callback.
 */
Core.prototype.callCallback = function(callbackFunctionName, jsonData) {

	if (this.config.debug) {
		if(typeof(jsonData) == 'object'){
			this.info("JS callback '" + callbackFunctionName + "'' called. With data: " + JSON.stringify(jsonData,null,4));
		}else{
			this.info("JS callback '" + callbackName + "' called. With data: " + jsonData);
		}
	}

	if (callbackFunctionName in nativeCallbackFunctions) {

		var callbackFunction = nativeCallbackFunctions[callbackFunctionName].callbackFunction;
		var callerFunctionName = nativeCallbackFunctions[callbackFunctionName].callerFunctionName;

		var method = privateHelpers.getNativeMethodDefinition(callerFunctionName);

		if (privateHelpers.isCallbackDataValidForMethodDefinition(method, jsonData) == false) {
			this.error(callerFunctionName + "() callback data does not match definition!");
			return;
		}

		callbackFunction(jsonData);

	} else {
		this.error(callbackFunctionName + "() callback not defined!");
	}
};

/**
 * callNative is used to call a native function from JS.
 * @param  {string}   functionName Name of the native function.
 * @param  {any}   payload      Payload to deliver to the native function
 * @param  {Function} callback     JS callback function to receive return values from native.
 */
Core.prototype.callNative = function(functionName, payload, callback) {
		this.callModule("local", nativeMethodDefinition,payload,callbackKey);
};

/**
 * callNative is used to call a native function from JS.
 * @param  {string}   namespace or module name of the handling module
 * @param  {string}   functionName Name of the native function.
 * @param  {any}   payload      Payload to deliver to the native function
 * @param  {Function} callback     JS callback function to receive return values from native.
 */
Core.prototype.callModule = function(namespace, functionName, payload, callback) {

	if (this.config.debug) {
		this.info("Native function " + functionName + "() called.");
	}

	//Get native method definition
	var nativeMethodDefinition = privateHelpers.getNativeMethodDefinition(functionName);

	// is method defined?
	if (nativeMethodDefinition === undefined) {
		this.error(functionName + "() is not implemented in Native Code!");
		return;
	}

	// is payload type correct?
	if (privateHelpers.isNativeMethodPayloadValid(nativeMethodDefinition, payload) == false) {
		return;
	}


	if (callback !== undefined) {
		//Generate temporary key for callback function
		var callbackKey = privateHelpers.generateId();
		nativeCallbackFunctions[callbackKey] = {
			callerFunctionName: functionName,
			callbackFunction: function(data) {
				callback(data);
				//Free memory
				delete nativeCallbackFunctions[callbackKey];
			}
		};
	}

	privateHelpers.execNativeCall(namespace, nativeMethodDefinition,payload,callbackKey);
};


/**
 * Publishes a custom JS function to the PeakCore system.
 * @param  {string} functionName The name of the function.
 * @param  {object} func         The function itself.
 */
Core.prototype.publishFunction = function(functionName, func){

	var JSMethodDefinition = privateHelpers.getJSMethodDefinition(functionName);

	if(JSMethodDefinition === undefined){
		this.error(functionName +"() is not declared in method definitions!")
		return;
	}

	//Register a callable JS Function that simply broadcasts an event that has the same name as the function
	publishedJSFunctions[functionName] = func;
	if(this.config.debug){
		this.info(functionName + "() has been published!")
	}
};


//
// Export the PeakCore class
module.exports = Core;
