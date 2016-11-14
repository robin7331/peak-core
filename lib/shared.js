

var Shared = function Shared(peak) {

   if (peak === undefined) {
      console.error("shared.js - No PeakCore instance given!");
   }

   this.peak = peak;
   this.data = {};


}

Shared.prototype.initialize = function() {
   // Tell peak that it has to wait until shared has loaded completely.
   this.peak.addSubcomponentToInitialize()

   let that = this;
   this.peak.modules['peakCore'].setSharedValue = function(payload) {
      that.data[payload.key] = payload.value
   }

   if (this.peak.helpers.isiOS() || this.peak.helpers.isAndroid()) {
      this.peak.callNative('peakCore', 'getSharedStore', function(store) {
         that.data = store
         that.peak.subcomponentDidInitialize()
      })
   } else {
      this.peak.info("Store not available since we are not on iOS or Android.")
      that.peak.subcomponentDidInitialize()
   }


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

Shared.prototype.setPersistent = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedPersistentValue', {
       'key': key,
       'value' : value,
       'secure' : false
    });
}

Shared.prototype.setPersistentSecure = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedPersistentValue', {
       'key': key,
       'value' : value,
       'secure' : true
    });
}
module.exports = Shared
