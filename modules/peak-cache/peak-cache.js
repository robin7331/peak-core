


var Cache = function (peak) {
   this.peak = peak;
   this.error = peak.error;
   this.info = peak.info;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
            {
                name: 'getCached',			
                payloadType: 'string',
                callbackDataType: 'string'
            },
            {
                name: 'updateCache',		
                payloadType: 'string',
                callbackDataType: 'string'
            },
			{
                name: 'getCachedObj',	
                payloadType: 'string',
                callbackDataType: 'string'
            },
            {
                name: 'updateCacheObj',	
                payloadType: 'string',
                callbackDataType: 'string'
            }
   ];
   this.JSMethods = [];
}

Actions.prototype.getCached = function(url, callback) {
    this.peak.callAsync('getCached',url, callback);
}

Actions.prototype.updateCache = function(url, callback) {
     this.peak.callNative('updateCache',url, callback);
}

Actions.prototype.getCachedObj = function(url, callback) {
     this.peak.callNative('getCachedAsText',url, callback);
}

Actions.prototype.updateCacheObj = function(url, callback) {
     this.peak.callNative('updateCacheAsText',url, callback);
}


module.exports = Cache;
