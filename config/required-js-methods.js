module.exports = {
	'peakCore' : [
		{
			name: 'enableDebug',
			payload: {
				dataType: 'boolean'
			},
			namespace: 'peakCore'
		},
		{
			name: 'setSharedValue',
			payload: {
				dataType: 'object',
				data: {
					key : 'string',
					value : 'string'
				}
			},
			namespace: 'peakCore'
		},
		{
			name: 'deleteSharedValue',
			payload: {
				dataType: 'string'
			},
			namespace: 'peakCore'
		}
	]
}
