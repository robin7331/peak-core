

var PeakModule = function (peak, customData) {
   this.peak = peak;
   this.error = peak.error;
   this.info = peak.info;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
      {
         name: 'callUserlandNative',
         payloadType: 'object'
      }
   ];
   this.JSMethods = [
      {
         name: 'callUserlandJS',
         payloadType: 'object'
      },
      {
         name: 'setNavBarTitle',
         payloadType: 'object'
      }
   ];
   this.publishedJSFunctions = [];
   this.publishedNativeFunctions = [];
}

PeakModule.prototype.setNativeFunctions() {

}

PeakModule.prototype.callUserlandJS = function(payload) {
   var userlandFunctionName = payload.userlandFunctionName,
   var userlandFunctionPayload = payload.userlandFunctionPayload,

   if (userlandFunctionname in this.publishedJSFunctions) {

   }

}

PeakModule.prototype.publishJSFunction = function(functionName) {

   this[functionName] = function(payload) {

   }

}


module.exports = PeakModule;
