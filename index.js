
var config = require('./config');
var helpers = require('./lib/helpers');
var Logger = require('./lib/logger');
var PrivateHelpers = require('./lib/private-helpers');

// private vars
var publishedJSFunctions = {};
var nativeCallbackFunctions = {};
var privateHelpers;
var registeredModules = {};

/**
 * The PKCore class is used to communicate between a JS context and a native iOS or Android app.
 * @param {array} nativeMethods Method definitions for all methods, that will be implemented on the native side.
 * @param {array} vueMethods    Method definitions for all methods, that will be implemented on the JS side.
 * @return {PKCore}      PKCore instance
 */
var Core = function PKCore(nativeMethods, JSMethods) {

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
	this.logger = new Logger(this, privateHelpers);

	// add given methods to the config object
	this.config.nativeMethods = this.config.nativeMethods.concat(nativeMethods);
	this.config.JSMethods = this.config.JSMethods.concat(JSMethods);

}

/**
 * Registeres a PEAK Module with this PKCore instance.
 * @param  {Object} ModuleClass The module class to be instantiated and registered
 * @return {Object}             An instance of the given module.
 */
Core.prototype.registerPKModule = function(ModuleClass) {

	if (module === undefined) {
		this.logger.error("Cannot register undefined PEAK module");
		return;
	}

	var module = new ModuleClass();

	if (module.packageJS === undefined) {
		this.logger.error("Module has no packageJS property defined!");
		return;
	}

	var packageJS = module.packageJS;
	var moduleName = packageJS.name;

	if (moduleName in registeredModules) {
		this.logger.info("Module " + moduleName + " was registered already!");
		return registeredModules[moduleName];
	}

	if (module.nativeMethods === undefined) {
		this.logger.error("Module " + moduleName + " has no nativeMethods property!");
		return;
	}

	if (module.JSMethods === undefined) {
		this.logger.error("Module " + moduleName + " has no JSMethods property!");
		return;
	}

	module.core = this;
	module.logger = this.logger;

	// add the module method definitions to the config object
	this.config.nativeMethods = this.config.nativeMethods.concat(module.nativeMethods);
	this.config.JSMethods = this.config.JSMethods.concat(module.JSMethods);

	this.logger.info("Module " + moduleName + " with version " + packageJS.version + " was registered");

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
		this.logger.info("JS function " + functionName + " called.");
		// that.$log("JS function " + functionName + " called.")
	}

	//Get JS method definition
	var JSMethodDefinition = privateHelpers.getJSMethodDefinition(functionName);

	// is method defined in config?
	if (JSMethodDefinition === undefined) {
		this.logger.error(functionName + "() is not implemented in JavaScript Code!");
		return;
	}

	// is payload type correct? (payload types for functions are defined in the config object)
	if (privateHelpers.isNativeMethodPayloadValid(JSMethodDefinition, payload) == false) {
		return;
	}

	// is nativeCallback valid? (callback function names for functions are defined in the config object)
	if(this.helpers.isAndroid() && privateHelpers.isJSMethodNativeCallbackValid(JSMethodDefinition, nativeCallback) == false){
		this.logger.error(functionName + "() wrong callback " + nativeCallback + "! Expected: " + JSMethodDefinition.callback.name);
		return;
	}

	//Check if this function was published
	if (functionName in publishedJSFunctions){
		var callbackData = publishedJSFunctions[functionName](payload);

		if (privateHelpers.isCallbackDataValidForMethodDefinition(JSMethodDefinition.callback, callbackData) == false) {
			this.logger.error(functionName + "() callback data does not match definition!");
			return;
		}

		if(callbackData !== undefined){
			if (this.helpers.isiOS()) {
				return callbackData;
			} else {
				if(this.config.debug){
					this.logger.info("Native Callback " + nativeCallback +"() called. With data: " + JSON.stringify(callbackData,null,4));
				}

				// execute the native call
				privateHelpers.execNativeCall(core, JSMethodDefinition.callback, callbackData);
			}

		}

	}
	else{
		this.logger.error(functionName + "() is not implemented in JavaScript! (not published?)");
	}
}

/**
 * This function is used by the native side to invoce a callback function.
 * @param  {string} callbackFunctionName The function name of the callback
 * @param  {any} jsonData     Payload of the callback.
 */
Core.prototype.callCallback = function(callbackFunctionName, jsonData) {
	//Check if the function is available

	if (this.config.debug) {
		this.logger.info("JS callback '" + callbackFunctionName + "'' called. With data: " + JSON.stringify(jsonData,null,4));
	}

	if (callbackFunctionName in nativeCallbackFunctions) {

		var callbackFunction = nativeCallbackFunctions[callbackFunctionName].callbackFunction;
		var callerFunctionName = nativeCallbackFunctions[callbackFunctionName].callerFunctionName;

		var method = privateHelpers.getNativeMethodDefinition(callerFunctionName);

		if (privateHelpers.isCallbackDataValidForMethodDefinition(method, jsonData) == false) {
			this.logger.error(callerFunctionName + "() callback data does not match definition!");
			return;
		}

		callbackFunction(jsonData);

	} else {
		this.logger.error(callbackFunctionName + "() callback not defined!");
	}
};

/**
 * callNative is used to call a native function from JS.
 * @param  {string}   functionName Name of the native function.
 * @param  {any}   payload      Payload to deliver to the native function
 * @param  {Function} callback     JS callback function to receive return values from native.
 */
Core.prototype.callNative = function(functionName, payload, callback) {

	if (this.config.debug) {
		this.logger.info("Native function " + functionName + "() called.");
	}

	//Get native method definition
	var nativeMethodDefinition = privateHelpers.getNativeMethodDefinition(functionName);

	// is method defined?
	if (nativeMethodDefinition === undefined) {
		this.logger.error(functionName + "() is not implemented in Native Code!");
		return;
	}

	// is payload type correct?
	if (privateHelpers.isNativeMethodPayloadValid(nativeMethodDefinition, payload) == false) {
		return;
	}


	if (callback !== undefined) {
		//Generate temporary key for callback function
		var callbackKey = _generateId();
		nativeCallbackFunctions[callbackKey] = {
			callerFunctionName: functionName,
			callbackFunction: function(data) {
				callback(data);
				//Free memory
				nativeCallbackFunctions[callbackKey] = {};
			}
		};
	}

	privateHelpers.execNativeCall(nativeMethodDefinition,payload,callbackKey);
};


/**
 * Publishes a custom JS function to the PKCore system.
 * @param  {string} functionName The name of the function.
 * @param  {object} func         The function itself.
 */
Core.prototype.publishFunction = function(functionName, func){

	var JSMethodDefinition = privateHelpers.getJSMethodDefinition(functionName);

	if(JSMethodDefinition === undefined){
		this.logger.error(functionName +"() is not declared in method definitions!")
		return;
	}

	//Register a callable JS Function that simply broadcasts an event that has the same name as the function
	publishedJSFunctions[functionName] = func;
	if(this.config.debug){
		this.logger.info(functionName + "() has been published!")
	}
};




// Export the PKCore class
module.exports = Core;
