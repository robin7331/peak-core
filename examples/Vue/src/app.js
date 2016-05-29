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

		peak.modules.peakUserland.bind('setNavBarTitle', this.setNavBarTitle);

	},


	methods: {
		setNavBarTitle: function(title) {
			peak.info("setting nav bar title to " + title);
			return "hi";
		}
	}
});
