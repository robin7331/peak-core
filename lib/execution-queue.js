var ExecutionQueue = function(peak) {
    this.peak = peak;
    this.queue = []

    var that = this;
    this.peak.modules['peakCore'].androidQueueReady = function() {
		that.androidQueueReady();
	}
}

/**
 * Takes execution urls and exectutes it directly or adds it to a internal queue
 * @param  {string}  the native call to be executed
 */
ExecutionQueue.prototype.execute = function (url) {
    if(this.queue.length == 0){
        this.queue.push(url)
        window.location = url;
    }else{
        this.queue.push(url)
    }
};


/**
 * Receives ready calls from native when a function got executed
 */
ExecutionQueue.prototype.androidQueueReady = function () {
   this.queue.shift();
   if(this.queue.length > 0){
       window.location = this.queue[0]
   }
};

module.exports = ExecutionQueue;