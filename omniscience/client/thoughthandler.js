(function () {
	omni.ThoughtHandler = function(socket) {
		this.socket = socket;
		this.thoughtCallBacks = {};
	}
	omni.ThoughtHandler.prototype.send = function(thought, callback) {
		var name = thought.name;
		this.socket.emit(name, thought, callback);
	};

	omni.ThoughtHandler.prototype.on = function(name, callback, callee) {
		this.socket.on(name, function(thought) { 
			if(typeof thought.sender !== "undefined" && thought.sender != null) {
				//TODO: Add additional validation functionality here
	
				callback.call(callee, thought) //We're assuming for now that socket.io correctly serializes and deserializes objects.			
			}
		});
	}
})()