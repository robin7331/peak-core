var config = {};
module.exports = config;

var pjson = require('./package.json');

config.debug = true;

config.consoleTag = "PEAK Core (" + pjson.version + ")";

config.nativeMethods = require('./config/supported-native-methods');
config.vueMethods = require('./config/supported-vue-methods');
