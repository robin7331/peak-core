
/**
 * Logger class acts as proxy to deliver console.logs to the native side. (They than show up in the native console instead of just in the JS console)
 * @param  {PeakCore} core An instance of the PeakCore class to handle native communications.
 * @return {Logger}      Logger instance
 */
var logger = function Logger(peak,privateHelpers) {
   if (peak === undefined) {
      console.error("logger.js - No PeakCore instance given!");
   }
   this.peak = peak;
   this.privateHelpers = privateHelpers;
   this.config = peak.config;

   this.infoMethodDefinition = this.peak.getNativeMethodDefinition('peakCore', 'log');
   this.errorMethodDefinition = this.peak.getNativeMethodDefinition('peakCore', 'logError');
}

/**
 * Log a debug message to the JS console and via PeakCore to the native console.
 * @param  {string} message The message that should be logged.
 * @param  {string} customTag The log message will include this custom tag if provided.
 */
logger.prototype.info = function(message, customTag) {

   if (customTag === undefined)
      customTag = 'JS  [' + this.config.name + ']';
   else
      customTag = 'JS  [' + this.config.name + ']' + "[" + customTag + "]";

   var logMsg = customTag + " ~> " + message;

   this.privateHelpers.execNativeCall(this.infoMethodDefinition, logMsg);
   console.log(logMsg);
}

/**
 * Log an error message to the JS console and via PeakCore to the native console.
 * @param  {string} message The message that should be logged.
 * @param  {string} customTag The log message will include this custom tag if provided.
 */
logger.prototype.error = function(message, customTag) {

  if (customTag === undefined)
     customTag = 'JS  [' + this.config.name + ']';
  else
     customTag = 'JS  [' + this.config.name + ']' + "[" + customTag + "]";

   var logMsg = customTag + " ~> " + message;

   this.privateHelpers.execNativeCall(this.errorMethodDefinition, logMsg);
   console.error(logMsg);
}

module.exports = logger;
