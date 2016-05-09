
var helpers = {};
module.exports = helpers;

/**
 * Checks wether the current user agent is running Android
 * @return {boolean} True if user agent is android
 */
helpers.isAndroid = function(){
		var ua = navigator.userAgent.toLowerCase();
  		return ua.indexOf("android") > -1;
};

/**
 * Generates a random function name
 * @return {string} Random function name
 */
helpers.generateId = function() {
	var cid = "";
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	for( var i=0; i < 8; i++ )
     	cid += chars.charAt(Math.floor(Math.random() * chars.length));
	return cid;
 };
