module.exports = {
   'peakCore' : [
      {
      	name: 'log',
         payload: {
            dataType: 'string'
         },
         namespace: 'peakCore'
      },
      {
      	name: 'logError',
         payload: {
            dataType: 'string'
         },
         namespace: 'peakCore'
      },
      {
      	name: 'onReady',
         namespace: 'peakCore'
      },
      {
         name: 'setSharedValue',
         payload: {
            dataType: 'object',
            data: {
               key: 'string',
               value: 'string'
            }
         },
         namespace: 'peakCore'
      },
      {
         name: 'setSharedPersistentValue',
         payload: {
            dataType: 'object',
            data: {
               key: 'string',
               value: 'string',
               secure: 'boolean'
            }
         },
         namespace: 'peakCore'
      },
      {
         name: 'getSharedStore',
         callback: {
            dataType: 'object',
            data: {}
         },
         namespace: 'peakCore'
      }
   ]
};
