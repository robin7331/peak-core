
/**
 * A collection of private helpers to operate PeakCore.
 * @param {PeakCore} core        A PeakCore instance
 * @param {object} privateData Data that some private helpers need.
 */
var Helpers = function PrivateHelpers(core, privateData) {
   this.core = core;
   this.publishedJSFunctions = privateData.publishedJSFunctions;
   this.nativeCallbackFunctions = privateData.nativeCallbackFunctions;
}


/**
 * Gets the native method definition for a given function name. (Method definitions are defined in the config object)
 * @param  {string} functionName The name of the function whos definition has to be returned.
 * @return {object}              Function definition or undefined if function not found.
 */
Helpers.prototype.getNativeMethodDefinition = function(functionName) {
	for (var i = 0; i < this.core.config.nativeMethods.length; i++) {
		var method = this.core.config.nativeMethods[i];
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
Helpers.prototype.getJSMethodDefinition = function(functionName) {
	for (var i = 0; i < this.core.config.JSMethods.length; i++) {
		var method = this.core.config.JSMethods[i];
		if (method.name == functionName) {
			return method;
		}
	}
	return undefined;
};

/**
 * Checks wether a given payload type matches the definition in the config object for that method.
 * @param  {object} nativeMethodDefinition Method definition of the method which payload has to be checked.
 * @param  {any} payload                The payload given.
 * @return {boolean}                        true or false wether the definition matches the payload or not.
 */
Helpers.prototype.isNativeMethodPayloadValid = function(nativeMethodDefinition, payload) {

	if (payload == null) {
		if  (nativeMethodDefinition.payloadType != 'none') {
			this.core.logger.error(nativeMethodDefinition.name + '(<'+ type +'>) Type mismatch. Expected <'+ nativeMethodDefinition.payloadType +'>');
			return false;
		}
		return true;
	}


	var type = typeof(payload);

	if (type == 'object' && payload.length !== undefined) { // if array
		type = 'array';
	}

	if (type != nativeMethodDefinition.payloadType) {
		this.core.logger.error(nativeMethodDefinition.name + '(<'+ type +'>) Type mismatch. Expected <'+ nativeMethodDefinition.payloadType +'>');
		return false;
	}

	//Check payloadData for objects
	if (type == 'object'){
		if (nativeMethodDefinition.payloadData === undefined){
			this.core.logger.error(nativeMethodDefinition.name + "PayloadData not declared!");
			return false;
		}
		for (var key in nativeMethodDefinition.payloadData) {
			if ((key in payload) == false) {
				this.core.logger.error(nativeMethodDefinition.name + "PayloadData mismatch! Expected <'" + key + "'>");
				return false;
			}
	}

	}

	return true;

};

/**
 * Checks wether the given native callback function name matches the defined name in the config object.
 * @param  {object} JSMethodDefinition Method definition for the called js function.
 * @param  {string} nativeCallback      Function name of the native callback.
 * @return {boolean}                     true or false
 */
Helpers.prototype.isJSMethodNativeCallbackValid = function(JSMethodDefinition, nativeCallback) {

	if(JSMethodDefinition.callback === undefined && (nativeCallback === undefined || nativeCallback === null)){
		return true;
	}

	if(JSMethodDefinition.callback === undefined){
		return false;
	}

	if(JSMethodDefinition.callback.name == nativeCallback){
		return true;
	}

	return false;
};

/**
 * Checks wether the given data from a callback matches the method definition.
 * @param  {object} JSMethodDefinition Method definition for the called js function.
 * @param  {[type]} jsonData         Callback payload
 * @return {boolean}                  true or false
 */
Helpers.prototype.isCallbackDataValidForMethodDefinition = function(JSMethodDefinition, jsonData) {
	//Used for VUE/JS Functions without a callback
	if(JSMethodDefinition === undefined && jsonData === undefined){
		return true;
	}

	if (JSMethodDefinition.callbackData === undefined && jsonData === undefined) {
		return true;
	}

	var type = typeof(jsonData);
	if (type == 'object' && jsonData.length !== undefined) { // if array
		type = 'array';
	}

	if (type != JSMethodDefinition.callbackDataType) {
		this.core.logger.error(JSMethodDefinition.name + '(<'+ type +'>) callback data type mismatch. Expected <'+ methodDefinition.callbackDataType +'>');
		return false;
	}

	if(type == 'object'){
		for (var key in JSMethodDefinition.callbackData) {
			if ((key in jsonData) == false) {
				this.core.logger.error(JSMethodDefinition.name + "CallbackData mismatch! Expected <'" + key + "'>");
				return false;
			}
		}
	}

	return true;
};

/**
 * Invokes a native method.
 * @param  {object} nativeMethodDefinition Method definition for native function
 * @param  {any} payload                   Native method payload
 * @param  {string} callbackKey            JS Callback function name.
 */
Helpers.prototype.execNativeCall = function(nativeMethodDefinition, payload, callbackKey) {
	if (this.core.helpers.isiOS()) {

      if (typeof(window) == 'undefined' || typeof(window.webkit) == 'undefined' || typeof(window.webkit.messageHandlers) == 'undefined') {
         console.error("PeakCore Library does not exist!");
         return;
		}

		window.webkit.messageHandlers.PeakCore.postMessage({
			functionName: nativeMethodDefinition.name,
			payload: payload,
			callbackKey: callbackKey
		});

	} else if (this.core.helpers.isAndroid()) {

		if (typeof(PeakCore) == 'undefined') {
         console.error("PeakCore Library does not exist!");
			return;
		}

		//Invoke native function with callback key as String
		if(payload === null || payload === undefined) {
			if(callbackKey === undefined){
				PeakCore[nativeMethodDefinition.name]();
			}else{
				PeakCore[nativeMethodDefinition.name](callbackKey);
			}
		}else{
			//Convert Objects to String
			if(typeof(payload) == 'object'){
				payload = JSON.stringify(payload);
			}
			if(callbackKey === undefined){
				PeakCore[nativeMethodDefinition.name](payload);
			}else{
				PeakCore[nativeMethodDefinition.name](payload,callbackKey);
			}
		}
	}
};

/**
 * Generates a random function name
 * @return {string} Random function name
 */
Helpers.prototype.generateId = function() {
   var cid = "";
   var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
   for( var i=0; i < 8; i++ ) {
      cid += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return cid;
};


/**
 * Converts any string into camelCase.
 * @param {string} str String to convert to camelCase.
 * @return {string} Converted String
 */
Helpers.prototype.toCamelCase = function(str) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
};


module.exports = Helpers;
