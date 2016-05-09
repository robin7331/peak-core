
var PKCore = require('../index');

var Core = new PKCore([],
   [
      {
         name: 'logMe',
         payloadType: 'string'
      }
   ]
);


Core.publishFunction("logMe", function(msg) {
   console.log(msg);
});

Core.callJS("logMe", "test 123");
