var ExecutionQueue = require('./execution-queue');

/**
 * A collection of private helpers to operate PeakCore.
 * @param {PeakCore} core        A PeakCore instance
 */
var PrivateHelpers = function(peak, privateData) {
   this.core = peak;

   // This is a temporary fix. After x times the subcomponentDidInitialize() method is called we assume Peak has loaded
   this.numOfComponentsToInitialize = 0;
   this.subcomponentsDidInitialize = 0;
   this.initializedCallback = null;
   this.executionQueue = new ExecutionQueue(peak); 
}

/**
 * Checks if a certain module was installed already
 * @param  {string}  namespace The namespace of the module
 * @return {Boolean}           True of False if modules was installed
 */
PrivateHelpers.prototype.isModuleInstalled = function (namespace) {
   return !(typeof(this.core.modules[namespace]) == 'undefined')
};



/**
 * Checks wether a given payload type matches the definition in the config object for that method.
 * @param  {object} nativeMethodDefinition Method definition of the method which payload has to be checked.
 * @param  {any} payload                The payload given.
 * @return {boolean}                        true or false wether the definition matches the payload or not.
 */
PrivateHelpers.prototype.isNativeMethodPayloadValid = function(nativeMethodDefinition, payload) {

	//Do not check in production mode
	if(!this.core.config.debug){
		return true;
	}

   // if we don't specify a payloadType in the method definition, we set it to none manually
   if (typeof(nativeMethodDefinition.payload) == 'undefined') {
      nativeMethodDefinition.payload = {
         dataType: 'none'
      }
   }

	if (payload == null) {
		if  (nativeMethodDefinition.payload.dataType != 'none') {
			this.core.logger.error(nativeMethodDefinition.name + '(<'+ type +'>) Type mismatch. Expected <'+ nativeMethodDefinition.payload.dataType +'>');
			return false;
		}
		return true;
	}


	var type = typeof(payload);

	if (type == 'object' && payload.length !== undefined) { // if array
		type = 'array';
	}

   if (type == 'number' && nativeMethodDefinition.payload.dataType == 'boolean') {
      return true
   }

	if (type != nativeMethodDefinition.payload.dataType) {
		this.core.logger.error(nativeMethodDefinition.name + '(<'+ type +'>) Type mismatch. Expected <'+ nativeMethodDefinition.payload.dataType +'>');
		return false;
	}

	//Check payloadData for objects
	if (type == 'object'){
		if (nativeMethodDefinition.payload.data === undefined){
			this.core.logger.error(nativeMethodDefinition.name + "PayloadData not declared!");
			return false;
		}
		for (var key in nativeMethodDefinition.payload.data) {
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
PrivateHelpers.prototype.isCallbackDataValidForMethodDefinition = function(JSMethodDefinition, jsonData) {

	//Do not check in production mode
	if(!this.core.config.debug){
		return true;
	}

	//Used for VUE/JS Functions without a callback
	if(JSMethodDefinition === undefined && jsonData === undefined){
		return true;
	}

   var callbackDefinition = JSMethodDefinition.callback;

   if (typeof(callbackDefinition) == 'undefined' && jsonData) {
      this.core.logger.error(JSMethodDefinition.namespace + "/" + JSMethodDefinition.name + ' has no defined callback in it\'s method definition.');
      return false;
   }

	if (typeof(callbackDefinition) == 'undefined' && typeof(jsonData) == 'undefined') {
		return true;
	}

	var type = typeof(jsonData);
	if (type == 'object' && jsonData.length !== undefined) { // if array
		type = 'array';
	}

	if (type != callbackDefinition.dataType) {
		this.core.logger.error(JSMethodDefinition.namespace + "/" + JSMethodDefinition.name + '(<'+ type +'>) callback data type mismatch. Expected <'+ callbackDefinition.dataType +'>');
		return false;
	}

	if(type == 'object'){
		for (var key in callbackDefinition.data) {
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
PrivateHelpers.prototype.execNativeCall = function(nativeMethodDefinition, payload, callbackKey) {


	if (this.core.helpers.isiOS()) {

      if (typeof(window) == 'undefined' || typeof(window.webkit) == 'undefined' || typeof(window.webkit.messageHandlers) == 'undefined') {
         console.error(this.core.config.name + "-ios does not exist!");
         return;
		}

      if(payload === null || payload === undefined) {
         payload = "";
      }

		window.webkit.messageHandlers.PeakCore.postMessage({
         methodDefinition: nativeMethodDefinition,
			payload: payload,
			callbackKey: callbackKey
		});

	} else if (this.core.helpers.isAndroid()) {

		if (typeof(PeakCore) == 'undefined' && !this.core.config.androidCompatMode) {
         	console.error(this.core.config.name + "-android does not exist!");
			return;
		}
		try{
			if(payload === null || payload === undefined) {
				payload = "null";
			}
			if(callbackKey === null || callbackKey === undefined){
				callbackKey = "null"
			}
			//Convert Objects to String
			if(typeof(payload) == 'object'){
					payload = JSON.stringify(payload);
			}
			if(nativeMethodDefinition.callback && nativeMethodDefinition.callback.name){
			//Invoke the callback function
				if(!this.core.config.androidCompatMode){
					PeakCore['invokeNativeCallback'](payload, callbackKey);
				}else{
					let schema = {
						"payload" : payload,
						"callbackKey" : callbackKey
					}
					let schemaAsString = JSON.stringify(schema);
					let encodedString = encodeURIComponent(schemaAsString);
					let peakURL = "PeakCore://callback?payload=" + encodedString;
					this.executionQueue.execute(peakURL);
				}
			}else{
			//Invoke native function name
				let nativeMethodDefinitionAsString = JSON.stringify(nativeMethodDefinition);
				if(!this.core.config.androidCompatMode){
					PeakCore['invokeNativeMethod'](nativeMethodDefinitionAsString, payload, callbackKey);
				}else{
					let schema = {
						"nativeMethodDefinition" : nativeMethodDefinitionAsString,
						"payload" : payload,
						"callbackKey" : callbackKey
					}
					let schemaAsString = JSON.stringify(schema);
					let encodedString = encodeURIComponent(schemaAsString);
					let peakURL = "PeakCore://invoke?payload=" + encodedString;
					this.executionQueue.execute(peakURL);
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
PrivateHelpers.prototype.generateId = function() {
   var cid = "__peakCallback";
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
PrivateHelpers.prototype.toCamelCase = function(str) {
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
PrivateHelpers.prototype.mergeObject = function (obj1, obj2) {
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

PrivateHelpers.prototype.addSubcomponentToInitialize = function() {
   this.numOfComponentsToInitialize += 1;
}

PrivateHelpers.prototype.subcomponentDidInitialize = function() {
   this.core.info("Subcomponent did initialize!")
   this.subcomponentsDidInitialize += 1;
   if (this.subcomponentsDidInitialize == this.numOfComponentsToInitialize) {
      if (this.initializedCallback)
         this.initializedCallback(this.core);
   }
}


module.exports = PrivateHelpers;
