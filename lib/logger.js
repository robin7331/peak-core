
/**
 * Logger class acts as proxy to deliver console.logs to the native side. (They than show up in the native console instead of just in the JS console)
 * @param  {PeakCore} core An instance of the PeakCore class to handle native communications.
 * @param  {array} privateHelpers The private helpers of the PeakCore class.
 * @return {Logger}      Logger instance
 */
var logger = function Logger(core, privateHelpers) {
   if (core === undefined) {
      console.error("No PeakCore instance given!");
   }
   if (privateHelpers === undefined) {
      console.error("No PeakCore Private Helpers given!");
   }
   this.core = core;
   this.config = core.config;
   this.privateHelpers = privateHelpers;
}

/**
 * Log a debug message to the JS console and via PeakCore to the native console.
 * @param  {string} message The message that should be logged.
 * @param  {string} customTag The log message will include this custom tag if provided.
 */
logger.prototype.info = function(message, customTag) {

   if (customTag === undefined)
      customTag = this.config.consoleTag;
   else
      customTag = this.config.consoleTag + " [" + customTag + "]";

   var logMsg = customTag + ": " + message;

   var logMethodDefinition = this.privateHelpers.getNativeMethodDefinition("log");
	this.privateHelpers.execNativeCall(logMethodDefinition, logMsg);

   console.log(logMsg);
}

/**
 * Log an error message to the JS console and via PeakCore to the native console.
 * @param  {string} message The message that should be logged.
 * @param  {string} customTag The log message will include this custom tag if provided.
 */
logger.prototype.error = function(message, customTag) {

   if (customTag === undefined)
      customTag = this.config.consoleTag;
   else
      customTag = this.config.consoleTag + " [" + customTag + "]";

   var logMsg = customTag + ": " + message;

   var logMethodDefinition = this.privateHelpers.getNativeMethodDefinition("logError");
	this.privateHelpers.execNativeCall(logMethodDefinition, logMsg);

   console.error(logMsg);
}

module.exports = logger;
