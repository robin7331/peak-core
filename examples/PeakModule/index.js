


var BasicEvents = function PeakBasicEvents() {
   this.packageJSON = require('./package.json');
   this.nativeMethods = [];
   this.JSMethods = [];
   this.installAsVuePlugin = false;
}

BasicEvents.prototype.testMethod = function(msg) {
   this.info("TestMethod of PeakBasicEvents module called");

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

}


module.exports = BasicEvents;
