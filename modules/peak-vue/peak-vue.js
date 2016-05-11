
var PeakWrapper = {};


PeakWrapper.install = function (Vue, options) {

   var PeakCore = require('../../index');
   var PeakCache = require('index');

   var peak;
   if (window.peak === undefined) {
      peak = new PeakCore();

      if (peak.modules.peakBasicEvents === undefined) {
         peak.installPeakModule(PeakCache);
      }
   }

   var peakCache = peak.modules.peakBasicEvents


   // 1. add global method or property
   //Vue.myGlobalMethod = ...
   // 2. add a global asset
   //Vue.directive('my-directive', {})
   // 3. add an instance method
   //Vue.prototype.$myMethod = ...
}

module.exports = PeakWrapper;
