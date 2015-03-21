(function() {
	omni.ThoughtHandler = function(namespaceSocket, sockets) {
		this.io = namespaceSocket;
		this.sockets = sockets;
		this.namesForCallbacks = {};
		this.namesForCallees = {};
	}

	/**
	 * @method sendAll
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Sends the specified thought to all clients.
	 * @param {omni.Thought} property - The thought to send.
	 */
	omni.ThoughtHandler.prototype.sendAll = function(thought) {
		var name = thought.name;
		this.io.emit(name, thought);
	}

	/**
	 * @method send
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Sends the specified thought to the client with the given unique identifer.
	 * @param {omni.Thought} property - The thought to send.
	 * @param {Any} id - The client's unique identifier
	 */
	omni.ThoughtHandler.prototype.send = function(thought, id) {
		var name = thought.name;
		var socket = this.sockets[id];
		socket.emit(name, thought);
	};

	/**
	 * @method broadcast
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Broadcasts the thought from the socket related to the client with the specified id.
	 * @param {omni.Thought} property - The thought to send.
	 */
	omni.ThoughtHandler.prototype.broadcast = function(thought, id) {
		var name = thought.name;
		var socket = this.sockets[id];
		socket.broadcast.emit(name, thought);
	}

	/**
	 * @method addSocket
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Adds the specified socket to the list of receivers.
	 * @param {Socket} property - The socket to add.
	 * @param {Any} id - The unique identifier of the client.
	 */
	omni.ThoughtHandler.prototype.addSocket = function(socket, id) {
		this.sockets[id] = socket;
		this.prepareSocket(socket);
	}

	/**
	 * @method applyFunctionToSocket
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Adds a callback on that socket for the specified name of the message.
	 * @param {String} name - The name of the message.
	 * @param {String} callback - The callback to add.
	 * @param {Any} callee - The "this" argument of the callback.
	 * @param {Socket} socket - The socket to add the callback to.
	 */
	omni.ThoughtHandler.prototype.applyFunctionToSocket = function(name, callback, callee, socket) {
		var obj = this;
		socket.on(name, function(thought, acknowledgementFunction) { 
			if (typeof thought.sender !== "undefined" && thought.sender != null)
			{
	
				callback.call(callee, thought) //We're assuming for now that socket.io correctly serializes and deserializes objects.	

				var receivers = thought.receivers;
				if(typeof receivers === "undefined" || receivers == null)
				{
					obj.broadcast(thought, thought.sender);
				}
				else if(Array.prototype.isPrototypeOf(receivers))
				{
					for(var i = 0; i < receivers.length; i++)
					{
						var id = receivers[i];
						obj.send(thought, id);
					}
				}
			}
		});
	}

	/**
	 * @method prepareSocket
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc adds all the callbacks for this handler to the given socket.
	 * @param {Socket} socket - The socket to add the callbacks to.
	 */
	omni.ThoughtHandler.prototype.prepareSocket = function(socket) {

		for(name in this.namesForCallbacks)
		{
			var callback = this.namesForCallbacks[name];
			var callee = this.namesForCallees[name];

			this.applyFunctionToSocket(name, callback, callee, socket);
		}
	}

	/**
	 * @method on
	 * @public
	 * @memberof (server) omni.(server) ThoughtHandler#
	 * @desc Creates a callback for a specific thought with the specified name.
	 * @param {String} name - The name of the thought to match for the callback.
	 * @param {Function} callback - The callback to call when the thought is received.
	 * @param {Object} callee - The object to use as the "this" argument for the callback.
	 * @param [Function] validationFunction - The function to use to validate the thought. Should return true if the thought is valid.
	 */
	omni.ThoughtHandler.prototype.on = function(name, callback, callee, validationFunction) {
		var func = function(thought) {
			validationFunction = (validationFunction || function() { return true });
			if( validationFunction() === true)
			{
				return callback.call(this, thought);
			}
		}

		this.namesForCallbacks[name] = func;
		this.namesForCallees[name] = callee;

		for(var id in this.sockets)
		{
			var socket = this.sockets[id];
			this.applyFunctionToSocket(name, func, callee, socket);
		}
	}

})();