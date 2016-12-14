

var Shared = function Shared(peak) {

   if (peak === undefined) {
      console.error("shared.js - No PeakCore instance given!");
   }

   this.peak = peak;
   this.data = {};
   this.observers = {};

   Array.prototype.contains = function(obj) {
      var i = this.length;
      while (i--) {
          if (this[i] === obj) {
              return true;
          }
      }
      return false;
  }

}

Shared.prototype.initialize = function() {
   // Tell peak that it has to wait until shared has loaded completely.
   this.peak.addSubcomponentToInitialize()

   var that = this;
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
      that.notify(payload.key);
   }

}

Shared.prototype.notify = function(key) {
  for (var observerIndex in this.observers[key]) {
    this.observers[key][observerIndex](this.data[key]);
  }
};

Shared.prototype.watch = function(key, callback) {

  if (this.observers[key] === undefined) {
    this.observers[key] = [];
  }

  this.observers[key].push(callback);

};

Shared.prototype.get = function(key) {
   var test = this.data[key];
   return test;
};

Shared.prototype.set = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedValue', {
       'key': key,
       'value' : value
    });
    this.notify(key);
};

Shared.prototype.setPersistent = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedPersistentValue', {
       'key': key,
       'value' : value,
       'secure' : false
    });
    this.notify(key);
};

Shared.prototype.setPersistentSecure = function(key, value) {
   this.data[key] = value;
   this.peak.callNative('peakCore', 'setSharedPersistentValue', {
       'key': key,
       'value' : value,
       'secure' : true
    });
    this.notify(key);
}
module.exports = Shared
