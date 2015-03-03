(function() {
	omni.Conscience = function(io, name) {
		this.io = io;
		this.name = name;
		
		this.cleanName = omni.getCleanNameForNamespace(name);


		this.thoughtNamespace = io.of(omni.getNameForNamespace(this.cleanName, omni.THOUGHT));
		this.stateNamespace = io.of(omni.getNameForNamespace(this.cleanName, omni.STATE));

		console.log(omni.getNameForNamespace(this.cleanName, omni.STATE))

		this.socketForId = {};
		this.clients = [];

		this.state = new omni.Property("state", function() { return this.value; }, function() {}, {});

		this.thoughtHandler = new omni.ThoughtHandler(this.thoughtNamespace, this.socketForId);
		this.stateHandler = new omni.StateHandler(this.stateNamespace, this.socketForId, this.state);

		var obj = this;
		this.thoughtNamespace.on("connection", function(socket) {
			console.log("a connection")
			var id = obj.generateId();
			obj.socketForId[id] = socket;
			socket.on(omni.REQUEST_TOKEN, function(data, callback) {
				for(objId in obj.socketForId) {
					var objSocket = obj.socketForId[objId]
					if(objSocket === socket) {
						callback(objId)
						return;
					}
				}

				id = obj.generateId();
				obj.socketForId[id] = socket;

				callback(id)
			})
			obj.onClientConnected(id, socket);
			obj.thoughtHandler.addSocket(socket, id);
		})
	}

	omni.Conscience.prototype.onClientConnected = function(id, socket) {
		//This function is to be overwritten
	}

	omni.Conscience.prototype.generateId = function() {
		return Math.uuidFast();
	}

	omni.Conscience.prototype.onThought = function(name, callback, callee, validationFunction) {
		var obj = this;

		var func = function(thought) {
			if(obj.validateThought(thought) === true) {
				return callback.call(this, thought);
			}
		}
		this.thoughtHandler.on(name, func, callee, validationFunction);
	}

	omni.Conscience.prototype.validateThought = function(thought, socket) {
		if(this.socketForId[thought.token] !== socket) {
			return false;
		}
		return true;
	}

	omni.Conscience.prototype.sendThought = function(data, receivers, name) {
		var thought = new omni.Thought(data, name, this.token, receivers);
		if(typeof receivers === "undefined" || receivers == null)
		{
			this.thoughtHandler.sendAll(thought);
		}
		else
		{
			for(var i = 0; i < receivers.length; i++)
			{
				var id = receivers[i];

				this.thoughtHandler.send(thought, id);
			}
		}
	}

	omni.Conscience.prototype.addProperty = function(object, name, options) {
		this.stateHandler.addProperty(object, name, options);
	}

	omni.Conscience.prototype.removeProperty = function(object, name) {
		this.stateHandler.removeProperty(object, name);
	}
	
})();