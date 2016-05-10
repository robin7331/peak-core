


var BasicEvents = function PeakBasicEvents() {
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

BasicEvents.prototype.install = function(Vue, options) {

   var that = this; // that == PeakBasicEvents

   Vue.globalMethodTest = function(msg) {
      that.info(msg);
   };


   Vue.prototype.$instanceMethodTest = function(msg) {
      that.info(msg);
   }

   Vue.directive('my-directive', {
      this.getCachedJSON("Bla");
   });

}


module.exports = BasicEvents;
