
var helpers = {};

/**
 * Checks wether the current user agent is running Android
 * @return {boolean} True if user agent is android
 */
helpers.isAndroid = function(){
	   if ((typeof navigator == 'undefined')) {
			return false;
		}
		var ua = navigator.userAgent.toLowerCase();
  		return ua.indexOf("android") > -1;
};

/**
 * Checks wether the current user agent is running iOS
 * @return {boolean} True if user agent is iOS
 */
helpers.isiOS = function(){
  		return !helpers.isAndroid();
};


module.exports = helpers;
