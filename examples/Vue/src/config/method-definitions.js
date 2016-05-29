module.exports = {
   native: [
      {
      	name: 'logTest',			//Mandatory (unchecked)
      	payloadType: 'string'
      },
      {
         name: 'callbackTest',
         payloadType: 'number',
         callback: {
            callbackDataType: 'string'
         }
      }
   ],
   js: [
      {
         name: 'setNavBarTitle',			//Mandatory (unchecked)
         payloadType: 'string',
         callback: {
            callbackDataType: 'string'
         }
      }
   ]
}
