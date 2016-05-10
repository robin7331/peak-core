<style lang="scss">
$primary-color: #FFF;
.list {
	.container {
		margin:0px auto;
		width: 100%;

		display: -webkit-box;  /* OLD - iOS 6-, Safari 3.1-6, BB7 */
		display: -ms-flexbox;  /* TWEENER - IE 10 */
		display: -webkit-flex; /* NEW - Safari 6.1+. iOS 7.1+, BB10 */
		display: flex;         /* NEW, Spec - Firefox, Chrome, Opera */

		-webkit-flex-direction: column;
		flex-direction: column;
		align-items: center;
		padding: 0 0;
		background-color: $primary-color;
	}

}
</style>

<template>
	<div class="list">
		<div class="container">
			<list-item v-for="item in items" :name="item.name" @click="clicked(item)"></list-item>
		</div>
	</div>
</template>

<script>

var ListItem = require('./list-item.vue');
var TAG = "List-Component"

// var PeakCore = require('../../../../index');
// var nativeMethods = require('../config/method-definitions');
// var core = new PeakCore(nativeMethods.native);

module.exports = {

	ready: function() {

	},

	components: {
		'list-item' : ListItem
	},

	data: function() {
		return {
			items : [
				{name: "Hello 1"},
				{name: "Hello 2"},
				{name: "Hello 3"},
				{name: "Hello 4"}
			]
		};
	},

	methods: {

		addItem: function(){
			this.items.push({name: "Appended"});

		},
		getUser: function(userName){
			var user = {
					name: userName,
					score: 99.99
				};
			return user;
		},


		clicked: function(item) {

			// var basicEvents = this.peak.modules.peakBasicEvents;
			// basicEvents.getCachedJSON("")
			//
			// var that = this;
			// this.peak.callNative("callbackTest", 123, function(payload) {
			// 	that.peak.info(payload);
			// });
			//
			// window.peak.info();
			// this.info();
			//
			// o


			peak.helpers.isAndroid();

			peak.info();


		}
	}

}
</script>
