var DEBUG = true

var Vue = require('vue');
Vue.config.devtools = DEBUG;
Vue.config.debug = DEBUG;

var PeakCore = require('../../../index');
var peak = new PeakCore();
peak.config.debug = DEBUG;
peak.makeGlobal('peak');


// var PeakActions = require('../../../modules/peak-actions');
// var peakActions = peak.installPeakModule(PeakActions);
//
var methods = require('./config/method-definitions');
var PeakUserland = require('../../../modules/peak-userland');
var peakUserland = peak.useModule(PeakUserland, methods);


var vueTouch = require('vue-touch');
var options = {};
Vue.use(vueTouch, options);


var jQuery = require("jQuery");
var List = require('./components/list.vue');

MyAPP = new Vue({
	el: '#app',
	data: {
		currentResult: ''
	},
	components: {
		'list' : List
	},
	ready: function() {

		// peak.modules.peakUserland.bind('callbackTest', 101, function(data) {
		// 	peak.info("callback: " + data);
		// });

		// peak.modules.peakUserland.callbackTest(101, function(data) {
		// 		peak.info("callback: " + data);
		// })

		// peak.callNative('peakUserland', 'callbackTest', 101, function(data) {
		// 		peak.info("callback: " + data);
		// })
		//
		// th

		// peak.info("test 123");
		//
		//
		//
		//
		const userland = peak.modules.peakUserland // grab a reference to the userland module
      userland.bind('clear', this.clearUI)       // 'bind' this.clearUI to the defined method definition. This method can now be called from native.
      userland.bind('getCurrentResult', this.getCurrentResult)

      // After binding a method, you could also access it through:
      userland.clear()

		// peak.modules.peakUserland.bind('setNavBarTitle', this.setNavBarTitle);

	},


	methods: {

	  clearUI() {
		  this.currentResult = ''
		  peak.info("results cleared!")     // You can always access the logger via this.peak.info or this.peak.error (or this.peak.logger)
	  },
	  getCurrentResult(payload, callback) {
		  peak.info("Payload " + payload)
		  peak.info("callback " + callback)
		  return this.currentResult * 1;
	  },
	  store() {
		  const userland = peak.modules.peakUserland;
		  userland._callNative('storeResult', this.currentResult * 1);
	  },
	  retrieve() {
		  const userland = peak.modules.peakUserland;
		  const that = this;
		  userland._callNative('getLastResult',  null, function(result) {
			  that.currentResult = result;
		  });
	  }
  }
});
