var DEBUG = true

var Vue = require('vue');
Vue.config.devtools = DEBUG;
Vue.config.debug = DEBUG;

var PeakCore = require('../../../index');
var nativeMethods = require('./config/method-definitions');
var core = new PeakCore(nativeMethods.native);
core.config.debug = DEBUG;
Vue.use(core);

var PeakModule = require('../../PeakModule');
var peakModule = core.installPeakModule(PeakModule, Vue);


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
	}
});
