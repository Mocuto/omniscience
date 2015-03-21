
(function() {

	/**
	 *  @class (client) Conscience
	 *  @classdesc A Conscience, the main object of the Omniscience library. Handles thought and state communication.
	 *  @param {string} name - The name of the conscience.
	 *  @param {Any} [token = null] - the unique identifying token that identifies this client.
	 *  @memberof (client) omni
	*/

	omni.Conscience = function(name, token) {
		if(typeof token === "undefined")
		{
			token = null;
		}

		this.name = name;
		this.token = token;

		this.cleanName = omni.getCleanNameForNamespace(name);

		var thoughtNamespace = io(omni.getNameForNamespace(this.cleanName, omni.THOUGHT));
		this.thoughtNamespace = thoughtNamespace;

		var stateNamespace = io(omni.getNameForNamespace(this.cleanName, omni.STATE));
		this.stateNamespace = stateNamespace;


		var obj = this;
		this.thoughtHandler = new omni.ThoughtHandler(thoughtNamespace);

		this.thoughtNamespace.on("connect", function() {

			if(this.token == null)
			{
				obj.requestToken();
			}

			obj.onConnected();
		})

		this.stateNamespace.on("connect", (function() {
			this.stateHandler.onConnected()
		}).bind(this));

		this.stateHandler = new omni.StateHandler(stateNamespace);
	}


	/**
	 * @method requestToken
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Requests the token from the server. Called in the constructor after the connection to the server is established.
	 */
	omni.Conscience.prototype.requestToken = function() {
		var obj = this;
		this.thoughtNamespace.emit(omni.REQUEST_TOKEN, "test", function(token) {
			obj.token = token;
			obj.getState("", function(state) {
				console.log("TEST");
				obj.state = state;
				console.log(token);
				obj.stateHandler.token = token;
			})
			obj.onTokenGranted();
		})
	}

	/**
	 * @method onConnected
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Called when the connection to the server is establisehd. To be overriden.
	 */
	omni.Conscience.prototype.onConnected = function() {
		//This function is to be overwritten
	}

	/**
	 * @method onTokenGranted
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Called when the server grants the request for a token. To be overriden.
	 */
	omni.Conscience.prototype.onTokenGranted = function() {
		//This function is to be overwritten
	}

	/**
	 * @method onThought
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Creates a callback for a specific thought with the specified name.
	 * @param {String} name - The name of the thought to match for the callback.
	 * @param {Function} callback - The callback to call when the thought is received.
	 * @param {Object} callee - The object to use as the "this" argument for the callback.
	 */
	omni.Conscience.prototype.onThought = function(name, callback, callee) {
		this.thoughtHandler.on(name, callback, callee);
	}

	/**
	 * @method sendThought
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Creates a thought with the specified data, name, and sends it to the specified receivers.
	 * @param {Any} data - the data to send with the thought
	 * @param {String} - The name of the thought.
	 * @param {Array} receivers - an array ot tokens indicating the clients of which to receieve the thought. Put null to send to all clients
	 */
	omni.Conscience.prototype.sendThought = function(data, name, receivers, callback) {
		if(this.token == null) {
			return;
		}
		var thought = new omni.Thought(data, name, this.token, receivers);
		this.thoughtHandler.send(thought, callback)
	}

	/**
	 * @method getState
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc gets the state from the server with the specified name and passes it as a parameter to a callback function.
	 * @param {String} name - The name of the state.
	 * @param {Function} - The callback to call with the retrieved state.
	 */
	omni.Conscience.prototype.getState = function(name, callback) {
		this.stateHandler.map(this.token, name, callback);
	}

	/**
	 * @method setState
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc sets the state for a server side property with the given name.
	 * @param {String} name - The name of the state.
	 * @param {Any} value - The value to assign the state.
	 * @param {Function} - The callback to call upon successfully setting the state.
	 */
	omni.Conscience.prototype.setState = function(name, value, callback) {
		this.stateHandler.set(this.token, name, value, callback);
	}

	/**
	 * @method hook
	 * @public
	 * @memberof (client) omni.(client) Conscience#
	 * @desc Establishes server to client databinding for the given state to a given client side object (AKA "hooking").
	 * @param {String} serverName - The name of the state as stored on the server.
	 * @param {Object} clientObject - The client side object that will contain the property.
	 * @param {String} clientName - The name of the property as stored on the client.
	 */

	omni.Conscience.prototype.hook = function(serverName, clientObject, clientName) {
		this.stateHandler.hook(this.token, serverName, clientObject, clientName);
	}
})();