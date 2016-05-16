

var PeakModule = function (peak) {
   this.peak = peak;
   this.error = peak.error;
   this.info = peak.info;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
      {
         name: 'nativeMethod',
         payloadType: 'string',
         callback: {
            callbackDataType: 'string'
         }
      }
   ];
   this.JSMethods = [
      {
         name: 'jsMethod',
         payloadType: 'string',
         callback: {
            callbackDataType: 'string'
         }
      }
   ];
}



PeakModule.prototype.jsMethod = function(msg) {
   this.info(msg, 'PeakModule');

   return "hello world";
}

PeakModule.prototype.getCachedJSONForKey = function(key, callback) {


   this.info(msg, 'PeakModule');

   return "hello world";
}


module.exports = PeakModule;
