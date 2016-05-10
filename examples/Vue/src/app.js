var DEBUG = true

var Vue = require('vue');
Vue.config.devtools = DEBUG;
Vue.config.debug = DEBUG;

var PeakCore = require('../../../index');
var nativeMethods = require('./config/method-definitions');
var peak = new PeakCore(nativeMethods.native);
peak.config.debug = DEBUG;
Vue.use(peak);

var PeakModule = require('../../PeakModule');
var peakModule = peak.installPeakModule(PeakModule, Vue);


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
		this.peak.info("Hello from Vue");

		this.peak.callNative("logTest", "This is a fucking Log");
	}
});
