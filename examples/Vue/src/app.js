var DEBUG = true

var Vue = require('vue');

var PKCore = require('../../../index');
var nativeMethods = require('./config/method-definitions');
var core = new PKCore(nativeMethods.native);

if(DEBUG) {
	Vue.config.debug = true;
	Vue.config.devtools = true;
}

var vueTouch = require('vue-touch');
var options = {};
Vue.use(vueTouch, options);

var jQuery = require("jQuery");
var List = require('./components/list.vue');

// var TAG = "Vue-App"

MyAPP = new Vue({
	el: '#app',
	data: {

	},
	components: {
		'list' : List
	},
	ready: function() {
		core.logger.info("Hello World from JavaScript!");
	}
});
