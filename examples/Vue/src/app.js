var DEBUG = true

var Vue = require('vue');
Vue.config.devtools = DEBUG;
Vue.config.debug = DEBUG;

var PeakCore = require('../../../index');
var peak = new PeakCore();
peak.config.debug = DEBUG;
peak.makeGlobal('peak');
 

//var PeakModule = require('../../PeakModule');
//var peakModule = peak.useModule(PeakModule);

//var PeakActions = require('../../../modules/peak-actions');
//var peakActions = peak.useModule(PeakActions);

var UserlandMethods = require('./config/method-definitions');
var PeakUserland = require('../../../modules/peak-userland'); 
var peakUserland = peak.useModule(PeakUserland, UserlandMethods);
 
 
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

		//var peakModule = peak.modules.peakModule;
		// var peak Actions = peak.modules.peakActions;
		    
		  

		peak.modules.peakUserland.bind('setTitleJS', this.setTitleJS);
			 	  
		peak.modules.peakUserland.setTitleNative('Test'); 

		// this.peak.publishFunction('')
 

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
	},

	methods: {
		setTitleJS: function(title) {
			this.info("calling peak-userlandJS");
		}
	}
});
