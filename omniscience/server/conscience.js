(function() {

	/**
	 *  @class (server) Conscience
	 *  @classdesc A Conscience, the main object of the Omniscience library. Handles thought and state communication.
	 *  @param {Socket} io - The Socket.IO instance.
	 *  @param {String} name - The name of the conscience.
	 *  @memberof (server) omni
	*/
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

	/**
	 * @method onClientConnected
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Called when a client connects. This function is to be overriden.
	 * @param {Any} id - The unique identifier assigned to that client.
	 * @param {Socket} socket - The socket that handles communication with that client.
	 */
	omni.Conscience.prototype.onClientConnected = function(id, socket) {
		//This function is to be overwritten
	}

	/**
	 * @method generateId
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Generates a unique identifier. Can be overwritten.
	 * @returns {Any} A unique identifier.
	 */
	omni.Conscience.prototype.generateId = function() {
		return Math.uuidFast();
	}

	/**
	 * @method onThought
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Creates a callback for a specific thought with the specified name.
	 * @param {String} name - The name of the thought to match for the callback.
	 * @param {Function} callback - The callback to call when the thought is received.
	 * @param {Object} callee - The object to use as the "this" argument for the callback.
	 * @param [Function] validationFunction - The function to use to validate the thought. Should return true if the thought is valid.
	 */
	omni.Conscience.prototype.onThought = function(name, callback, callee, validationFunction) {
		var obj = this;

		var func = function(thought) {
			if(obj.validateThought(thought) === true) {
				return callback.call(this, thought);
			}
		}
		this.thoughtHandler.on(name, func, callee, validationFunction);
	}

	/**
	 * @method validateThought
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc A thought validation function for all thoughts that pass through this Conscience instance. Can be overriden.
	 * @param {omni.Thought} thought - The thought to validate.
	 * @param {Socket} socket - The socket with which to communciate with the sending client.
	 * @returns {Boolean} True if the thought is valid, false otherwise.
	 */
	omni.Conscience.prototype.validateThought = function(thought, socket) {
		if(this.socketForId[thought.token] !== socket) {
			return false;
		}
		return true;
	}

	/**
	 * @method sendThought
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Creates a thought with the specified data, name, and sends it to the specified receivers.
	 * @param {Any} data - the data to send with the thought
	 * @param {String} - The name of the thought.
	 * @param {Array} receivers - an array ot tokens indicating the clients of which to receieve the thought. Put null to send to all clients
	 */
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

	/**
	 * @method addProperty
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Adds an omni.Property to the specified object, with the given name.
	 * @param {Object} object - The object to add the property to.
	 * @param {String} name - The name of the property.
	 * @param {Object} options - The options with which to create the property.
	 * @param {Function} options.get - The get function of that property.
	 * @param {Function} options.set - The set function of that property.
	 * @param {Any} options.value - The default value of that property.
	 */
	omni.Conscience.prototype.addProperty = function(object, name, options) {
		this.stateHandler.addProperty(object, name, options);
	}

	/**
	 * @method removeProperty
	 * @public
	 * @memberof (server) omni.(server) Conscience#
	 * @desc Removes the omni.Property to the specified object with the given name.
	 * @param {Object} object - The object to add the property to.
	 * @param {String} name - The name of the property.
	 */
	omni.Conscience.prototype.removeProperty = function(object, name) {
		this.stateHandler.removeProperty(object, name);
	}
	
})();