
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
 * Checks if a certain module was installed already
 * @param  {string}  namespace The namespace of the module
 * @return {Boolean}           True of False if modules was installed
 */
Helpers.prototype.isModuleInstalled = function (namespace) {
   return !(typeof(this.core.modules[namespace]) == 'undefined')
};


/**
 * Gets the native method definition for a given function name. (Method definitions are defined in the config object)
 * @param  {string} functionName The name of the function whos definition has to be returned.
 * @return {object}              Function definition or undefined if function not found.
 */
Helpers.prototype.getNativeMethodDefinition = function(namespace, functionName) {
	for (var i = 0; i < this.core.config.nativeMethods[namespace].length; i++) {
		var method = this.core.config.nativeMethods[namespace][i];
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
Helpers.prototype.getJSMethodDefinition = function(namespace, functionName) {
	for (var i = 0; i < this.core.config.JSMethods[namespace].length; i++) {
		var method = this.core.config.JSMethods[namespace][i];
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

   var callbackDefinition = JSMethodDefinition.callback;

   if (callbackDefinition === undefined && jsonData) {
      this.core.logger.error(JSMethodDefinition.namespace + "/" + JSMethodDefinition.name + ' has no defined callback in it\'s method definition.');
      return false;
   }

	if (callbackDefinition.callbackData === undefined && jsonData === undefined) {
		return true;
	}

	var type = typeof(jsonData);
	if (type == 'object' && jsonData.length !== undefined) { // if array
		type = 'array';
	}

	if (type != callbackDefinition.callbackDataType) {
		this.core.logger.error(JSMethodDefinition.namespace + "/" + JSMethodDefinition.name + '(<'+ type +'>) callback data type mismatch. Expected <'+ callbackDefinition.callbackDataType +'>');
		return false;
	}

	if(type == 'object'){
		for (var key in callbackDefinition.callbackData) {
			if ((key in jsonData) == false) {
				this.core.logger.error(JSMethodDefinition.namespace + "/" + JSMethodDefinition.name + "CallbackData mismatch! Expected <'" + key + "'>");
				return false;
			}
		}
	}

	return true;
};

/**
 * Invokes a native method.
 * @param  {string} namespace              The namespace of the native method to call.
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
         methodDefinition: nativeMethodDefinition,
			payload: payload,
			callbackKey: callbackKey
		});

	} else if (this.core.helpers.isAndroid()) {

		if (typeof(PeakCore) == 'undefined') {
         console.error("PeakCore Library does not exist!");
			return;
		}
		try{
			//Invoke native function with callback key as String
			if(payload === null || payload === undefined) {
				if(callbackKey === undefined){
					PeakCore['execNative'](nativeMethodDefinition);
				}else{
					PeakCore['execNativeCallback'](nativeMethodDefinition, callbackKey);
				}
			}else{
				//Convert Objects to String
				if(typeof(payload) == 'object'){
					payload = JSON.stringify(payload);
				}
				if(callbackKey === undefined){
               PeakCore['execNative'](nativeMethodDefinition, payload);
				}else{
               PeakCore['execNativeCallback'](nativeMethodDefinition, payload, callbackKey);
				}
			}
		}catch(e){
			console.error(nativeMethodDefinition.namespace + "/" + nativeMethodDefinition.name + "(). Android Interface method not defined.")
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


/**
 * Merges two JS objects.
 * @param  {Object} obj1 First object
 * @param  {Object} obj2 Second object
 * @return {Object}      Result object
 */
Helpers.prototype.mergeObject = function (obj1, obj2) {
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];

      }
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }
  return obj1;
}


module.exports = Helpers;
