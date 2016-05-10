


var BasicEvents = function PeakBasicEvents(peak) {
   this.peak = peak;
   this.error = peak.error;
   this.info = peak.info;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
      {
      	name: 'getJSONForKey',
      	payloadType: 'string'
      }
   ];
   this.JSMethods = [];
   this.installAsVuePlugin = false;
}

BasicEvents.prototype.getCachedJSON = function(name) {
   this.info(name);

   this.peak.callNative("getJSONForKey", name, function() {

   });

}

BasicEvents.prototype.testMethod = function(msg) {
   this.log("TestMethod of PeakBasicEvents module called");



   this.peak.callNative("callbackTest", 123, function(payload) {
      that.peak.info(payload);
   });
}

module.exports = BasicEvents;
