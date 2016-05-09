var DEBUG = true
var Vue = require('vue');
if(DEBUG) {
	Vue.config.debug = true;
	Vue.config.devtools = false;
}

// var methods = require('./vue-native-interface-methods.js');
// var NativeInterface = require('./vue/vue-native-interface.js');
// Vue.use(NativeInterface,{methods: methods, debug: DEBUG});

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
		//  Vue.$vueReady(TAG);
		//this.$call("test");

		//console.log("isAndroid: " + this.$isAndroid());
		//console.log("isiOS: " + this.$isiOS());

		//console.log("user agent: " + navigator.userAgent);
	}
});
