

var Shared = function Shared(peak) {

   if (peak === undefined) {
      console.error("shared.js - No PeakCore instance given!");
   }

   this.peak = peak;
   this.data = {};

   let that = this;
   this.peak.modules['peakCore'].setSharedValue = function(payload) {
      that.data[payload.key] = payload.value
   }

}

Shared.prototype.get = function(key) {
   let test = this.data[key];
   return test;
}

Shared.prototype.set = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedValue', {
       'key': key,
       'value' : value
    });
}

module.exports = Shared
