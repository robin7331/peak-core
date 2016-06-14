module.exports = {
   native: [
      {
        name: 'storeResult',
        payload: {
           dataType: 'number'
        }
      },
      {
        name: 'getLastResult',
        callback: {
           dataType: 'number'
        }
      }
   ],
   js: [
      {
         name: 'clear'
      },
      {
         name: 'getCurrentResult',
         callback: {
            dataType: 'number'
         }
      }
   ]
}
