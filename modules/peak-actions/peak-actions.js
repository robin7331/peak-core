


var Actions = function (peak) {
   this.peak = peak;
   this.error = peak.error;
   this.info = peak.info;
   this.packageJSON = require('./package.json');
   this.nativeMethods = [
       {
            name: 'openMail',		
            payloadType: 'object',
            payloadData: {
                mailto: 'array',
                subject: 'string',
                body : 'string'
                }
        },
        {
            name: 'openURL',        
            payloadType: 'string'
        }
   ];
   this.JSMethods = [];
}

Actions.prototype.openMail = function(payload) {
   this.peak.callNative("openMail", payload);
}

Actions.prototype.openURL = function(payload) {
   this.peak.callNative("openURL", payload);
}


module.exports = Actions;
