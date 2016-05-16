var DEBUG = true

var Vue = require('vue');
Vue.config.devtools = DEBUG;
Vue.config.debug = DEBUG;

var PeakCore = require('../../../index');
var nativeMethods = require('./config/method-definitions');
var peak = new PeakCore();
peak.config.debug = DEBUG;
peak.makeGlobal('peak');


var PeakModule = require('../../PeakModule');
var peakModule = peak.installPeakModule(PeakModule);

var PeakActions = require('../../../modules/peak-actions');
var peakActions = peak.installPeakModule(PeakActions);


var vueTouch = require('vue-touch');
var options = {};
Vue.use(vueTouch, options);


var jQuery = require("jQuery");
var List = require('./components/list.vue');

MyAPP = new Vue({
	el: '#app',
	data: {

	},
	components: {
		'list' : List
	},
	ready: function() {

		var peakModule = peak.modules.peakModule;
		var peakActions = peak.modules.peakActions;


		// peakModule.callNativeModule('nativeMethod', 'native function payload', function(callbackPayload) {
		// 	peak.info("nativeMethodCallbackPayload: " + callbackPayload);
		// });
		//
		// peakActions.callNativeModule('openURL', 'https://www.google.de');
		//
		// peakModule.callNativeModule('nativeMethod', 'native function payload', function(callbackPayload) {
		// 	peak.info("nativeMethodCallbackPayload: " + callbackPayload);
		// });
		//
		// peakActions.openURL('https://www.google.de');


		// peak.modules.peakModule.nativeMethod()

		// this.peak.info("Hello from Vue");
		//
		//
		// this.peak.callNative("logTest", "This is a fucking Log");
	}
});
