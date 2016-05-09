module.exports = {
   native: [
      {
      	name: 'setNavigationBarTitle',			//Mandatory (unchecked)
      	payloadType: 'string'
      },
      {
      	name: 'logTest',			//Mandatory (unchecked)
      	payloadType: 'string'
      },
      {
         name: 'callbackTest',
         payloadType: 'number',
         callbackDataType: 'string'
      }
   ]
}
