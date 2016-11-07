var Store = function (peak) {
   this.peak = peak;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
            {
                name: 'put',			
                payloadType: 'string',
            },
            {
                name: 'get',		
                payloadType: 'string',
                callbackDataType: 'string'
            }
   ];
   this.JSMethods = [];
}

Store.prototype.put = function(dataString) {
    this.peak.callNative('put',url);
}

Store.prototype.get = function(url, callback) {
     this.peak.callNative('get',url, callback);
}

module.exports = Store;
