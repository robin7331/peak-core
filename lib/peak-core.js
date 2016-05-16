"use strict";

var Config = require('../config/config');
var Helpers = require('./helpers');
var Logger = require('./logger');
var PrivateHelpers = require('./private-helpers');


// private vars
var nativeCallbackFunctions = {};
var privateHelpers;
var installedModules = {};

/**
 * The PeakCore class is used to communicate between a JS context and a native iOS or Android app.
 * @return {PeakCore}      PeakCore instance
 */
var Core = function PeakCore() {

	// initialize the private helpers
	privateHelpers = new PrivateHelpers(this, {
		nativeCallbackFunctions: nativeCallbackFunctions
	});

	/**
	 * The configuration object
	 * @type {object}
	 */
	this.config = Config;

	/**
	 * Helpers object
	 * @type {object}
	 */
	this.helpers = Helpers;
	
	/**
	 * A Logger instance for logging messages to the native console
	 * @type {Logger}
	 */
	this.logger = new Logger(this,privateHelpers);

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


	// initialize the property that holds installed peak modules.
	this.modules = {};

}

/**
 * Makes this PeakCore instance available in the window.
 */
Core.prototype.makeGlobal = function(varName) {
   window[varName] = this;
}

/**
 * Registeres a PeakModule with this PeakCore instance.
 * @param  {Object} ModuleClass The module class to be instantiated and registered
 * @return {Object}             An instance of the given module.
 */
Core.prototype.useModule = function(ModuleClass, customData) {

	if (ModuleClass === undefined) {
		this.error("Cannot install undefined PeakModule");
		return;
	}

	var module = new ModuleClass(this, customData);
	

	if (module.packageJSON === undefined) {
		this.error("Module has no packageJSON property defined!");
		return;
	}
	var packageJSON = module.packageJSON;
	
	if (typeof(module.config) == 'undefined') {
		module.config = this.config.defaultModuleConfig;
	}else{
		for(var key in this.config.defaultModuleConfig){
			if((key in module.config) == false){
				module.config[key] = this.config.defaultModuleConfig[key];
			}
		}
	}
	
	var packageJSON = module.packageJSON;

	// get the plain module name without "@bitmechanics/".
	var moduleName = packageJSON.name.replace("@bitmechanics/", "");

	//convert came to camelCase.
	var moduleNameCamelCase = privateHelpers.toCamelCase(moduleName);

	// extra var for a more readable code. The module namespace is the camelCase version of the module name.
	var moduleNameSpace = moduleNameCamelCase;

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

	module._callNative = function(functionName, payload, callback) {
	   this.peak.callNative(moduleNameSpace, functionName, payload, callback);
	};
	
	for (var i = 0; i < module.nativeMethods.length; i++) {
		var definition = module.nativeMethods[i];
		if (typeof(definition.namespace) == 'undefined') {
			definition.namespace = moduleNameSpace;
		}
		//add function stubs to module to ease calling native functions with dot-notation
		if(module.config.generateFunctionStubs == true){
			module[definition.name] = function(funcName){
				return  function(payload, callback){
					module._callNative(funcName,payload,callback);
				};
			}(definition.name);
		}
	}
	var nativeMethodsObj = {};
	nativeMethodsObj[moduleNameSpace] = module.nativeMethods;
	
	for (var i = 0; i < module.JSMethods.length; i++) {
		var definition = module.JSMethods[i];
		if (typeof(definition.namespace) == 'undefined') {
			definition.namespace = moduleNameSpace;
		}
		if (module.config.skipJSMethodValidationOnInstall == false) {
			if (typeof(module[definition.name]) == 'undefined') {
				this.error(definition.name + " is not implemented in module " + moduleNameCamelCase);
			}
		}
	}
	var JSMethodsObj = {};
	JSMethodsObj[moduleNameSpace] = module.JSMethods;


	// add the module method definitions to the config object
	this.config.nativeMethods = privateHelpers.mergeObject(this.config.nativeMethods, nativeMethodsObj);
	this.config.JSMethods = privateHelpers.mergeObject(this.config.JSMethods, JSMethodsObj);

	if (this.config.debug) {
		this.info("nativeMethods: " + JSON.stringify(this.config.nativeMethods, null, 4));
		this.info("JSMethods: " + JSON.stringify(this.config.JSMethods, null, 4));
	}

	var infoMsg = "Module " + moduleName + " with version " + packageJSON.version + " was installed\n" 
						+ 'with configuration: ' + JSON.stringify(module.config,null,4);

	this.info(infoMsg);

	module._info = function(msg) {
		this.peak.info(msg,moduleName);	
	};
	
	module._error = function(msg) {
		this.peak.error(msg,moduleName);	
	};
	
	module.name = moduleName;
	module.namespace = moduleNameSpace;

	this.modules[moduleNameCamelCase] = module
	return module;
}

/**
 * callJS is used by the native side to call a method in JS.
 * @param  {string} namespace 	  The namespace of the JS function to call.
 * @param  {string} functionName   Name of the JS function.
 * @param  {any} payload           Payload to deliver to the function.
 * @param  {string} nativeCallback Function name of the native callback. (Only required on Android)
 */
Core.prototype.callJS = function(namespace, functionName, payload, nativeCallback) {

	if (this.config.debug) {
		this.info("JS function " + namespace + "/" + functionName + " called.");
	}

	if (privateHelpers.isModuleInstalled(namespace) == false) {
		this.error("Module " + namespace + " is not installed.")
		return;
	}

	//Get JS method definition
	var JSMethodDefinition = this.getJSMethodDefinition(namespace, functionName);

	// is method defined in config?
	if (JSMethodDefinition === undefined) {
		this.error(namespace + "/" + functionName + "() is not implemented in JavaScript Code!");
		return;
	}

	// is payload type correct? (payload types for functions are defined in the config object)
	if (privateHelpers.isNativeMethodPayloadValid(JSMethodDefinition, payload) == false) {
		this.error(namespace + "/" + functionName + "() payload not valid!");
		return;
	}

	var module = this.modules[namespace];

	//Check if this function was published
	var callbackData = module[functionName](payload);

	if (privateHelpers.isCallbackDataValidForMethodDefinition(JSMethodDefinition, callbackData) == false) {
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
			privateHelpers.execNativeCall(JSMethodDefinition, callbackData, callbackKey);
		}

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
			this.info("JS callback '" + callbackFunctionName + "' called. With data: " + jsonData);
		}
	}

	if (callbackFunctionName in nativeCallbackFunctions) {

		var callbackFunction = nativeCallbackFunctions[callbackFunctionName].callbackFunction;
		var callerFunctionName = nativeCallbackFunctions[callbackFunctionName].callerFunctionName;
		var callerNamespace = nativeCallbackFunctions[callbackFunctionName].callerNamespace;

		var method = this.getNativeMethodDefinition(callerNamespace, callerFunctionName);

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
 * @param  {string}   namespace or module name of the handling module
 * @param  {string}   functionName Name of the native function.
 * @param  {any}   payload      Payload to deliver to the native function
 * @param  {Function} callback     JS callback function to receive return values from native.
 */
Core.prototype.callNative = function(namespace, functionName, payload, callback) {

	if (this.config.debug) {
		this.info("Native function " + namespace + "/" + functionName + "() called.");
	}

	//Get native method definition
	var nativeMethodDefinition = this.getNativeMethodDefinition(namespace, functionName);

	// is method defined?
	if (nativeMethodDefinition === undefined) {
		this.error(namespace + "/" + functionName + "() is not a defined method.");
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
			callerNamespace: namespace,
			callerFunctionName: functionName,
			callbackFunction: function(data) {
				callback(data);
				//Free memory
				delete nativeCallbackFunctions[callbackKey];
			}
		};
	}

	privateHelpers.execNativeCall(nativeMethodDefinition, payload, callbackKey);
};

/**
 * Gets the native method definition for a given function name. (Method definitions are defined in the config object)
 * @param  {string} functionName The name of the function whos definition has to be returned.
 * @return {object}              Function definition or undefined if function not found.
 */
Core.prototype.getNativeMethodDefinition = function(namespace, functionName) {
	for (var i = 0; i < this.config.nativeMethods[namespace].length; i++) {
		var method = this.config.nativeMethods[namespace][i];
		if (method.name == functionName) {
			return method;
		}
	}
	return undefined;
};


/**
 * Gets the JS method definition for a given function name. (Method definitions are defined in the config object)
 * @param  {string} functionName The name of the function whos definition has to be returned.
 * @return {object}              Function definition or undefined if function not found.
 */
Core.prototype.getJSMethodDefinition = function(namespace, functionName) {
	for (var i = 0; i < this.config.JSMethods[namespace].length; i++) {
		var method = this.config.JSMethods[namespace][i];
		if (method.name == functionName) {
			return method;
		}
	}
	return undefined;
};



//
// Export the PeakCore class
module.exports = Core;
