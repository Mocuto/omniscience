(function () {

	/**
	 *  @class (client) ThoughtHandler
	 *  @classdesc Handles communicating with the server regarding thoughts. Has send and on operations.
	 *  @param {Socket} socket - The socket with which to communicate with the server.
	 *  @memberof (client) omni
	*/
	omni.ThoughtHandler = function(socket) {
		this.socket = socket;
		this.thoughtCallBacks = {};
	}

	/**
	 * @method send
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Sends the thought to the server.
	 * @param {omni.Thought} thought - The thought to send to the server.
	 * @param {Function} [callback = undefined] callback - The function to run upon the server's successful capture of the thought.
	 */
	omni.ThoughtHandler.prototype.send = function(thought, callback) {
		var name = thought.name;
		this.socket.emit(name, thought, callback);
	};

	/**
	 * @method on
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Creates a callback that is triggered upon receiving a thought with the specified name.
	 * @param {String} name - The name that will trigger the callback.
	 * @param {Function} callback - The callback.
	 * @param {Any} callee - The "this" argument of the callback.
	 * @param {Function] [validationFunc = undefined] - A function to validate the received thought.
	 */
	omni.ThoughtHandler.prototype.on = function(name, callback, callee, validationFunc) {
		this.socket.on(name, function(thought) { 
			if(typeof thought.sender !== "undefined" && thought.sender != null) {

				if(typeof validationFunc !== "undefined") {
					validationFunc(thought);
				}
	
				callback.call(callee, thought) //We're assuming for now that socket.io correctly serializes and deserializes objects.			
			}
		});
	}
})();