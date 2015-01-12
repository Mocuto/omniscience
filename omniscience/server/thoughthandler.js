(function() {
	omni.ThoughtHandler = function(namespaceSocket, sockets) {
		this.io = namespaceSocket;
		this.sockets = sockets;
		this.namesForCallbacks = {};
		this.namesForCallees = {};
	}

	omni.ThoughtHandler.prototype.sendAll = function(thought) {
		var name = thought.name;
		this.io.emit(name, thought);
	}
	omni.ThoughtHandler.prototype.send = function(thought, id) {
		var name = thought.name;
		var socket = this.sockets[id];
		socket.emit(name, thought);
	};

	omni.ThoughtHandler.prototype.broadcast = function(thought, id) {
		var name = thought.name;
		var socket = this.sockets[id];
		socket.broadcast.emit(name, thought);
	}

	omni.ThoughtHandler.prototype.addSocket = function(socket, id) {
		this.sockets[id] = socket;
		this.prepareSocket(socket);
	}

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

	omni.ThoughtHandler.prototype.prepareSocket = function(socket) {

		for(name in this.namesForCallbacks)
		{
			var callback = this.namesForCallbacks[name];
			var callee = this.namesForCallees[name];

			this.applyFunctionToSocket(name, callback, callee, socket);
		}
	}

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