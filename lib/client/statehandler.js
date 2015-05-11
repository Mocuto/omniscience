(function() {

	/**
	 *  @class (client) StateHandler
	 *  @classdesc Handles communicating with the server regarding state. Has get and set operations.
	 *  @param {Socket} socket - The socket with which to communicate with the server.
	 *  @memberof (client) omni
	*/
	omni.StateHandler = function(socket) {
		this.socket = socket;
		this.token = null;
		this.clientPairsForHookedName = {};

		var obj = this;
	};


	/**
	 * @method onConnected
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Called when the socket establishes a connection with the server. Prepares function callbacks.
	 */
	omni.StateHandler.prototype.onConnected = function() {
		this.socket.on(omni.HOOK_STATE, (function(propertyName, value) {

			var tokens = propertyName.split(".");


			var tokensIndex = 0;

			var name = tokens[0];

			var pair = this.clientPairsForHookedName[name];

			var i;
			for(i = 1; i < tokens.length && typeof pair == "undefined"; i++)
			{
				name = name + "." + tokens[i];

				pair = this.clientPairsForHookedName[name];

			}

			var clientObject = pair.object;
			var clientName = pair.name;

			for (; i < tokens.length - 1; i ++)
			{
				clientObject = clientObject[tokens[i]];
				clientName = tokens[i + 1];
			}

			clientObject[clientName] = value;

		}).bind(this));
	}

	/**
	 * @method convertChildProperties
	 * @private
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Converts the data object such that its child omni.Property instances are replaced with setters/getters to the corresponding server state.
	 * @param {Object} data - The data to be convereted.
	 */
	var convertChildProperties = function(data) {
		var result = data;
		if(Object.prototype.isPrototypeOf(data))
		{
			if(typeof data.__omniChildPropertyNames !== "undefined")
			{
				for(var i = 0; i < data.__omniChildPropertyNames.length; i++)
				{
					var childName = data.__omniChildPropertyNames[i];
					var property = data[childName];

					var queryName = property.fullName.substr((omni.STATE + ".").length)
					console.log(queryName);
					var getFunction = (function(propertyName) {
						return this.get(this.token, propertyName);
					}).bind(this, queryName);

					var setFunction = (function(propertyName, newValue) {
						this.set(this.token, propertyName, newValue)
					}).bind(this, queryName);

					Object.defineProperty(data, childName, {
						enumerable : true,
						get : getFunction,
						set : setFunction
					})
				}
			}
		}
		return data;
	}

	/**
	 * @method map
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Maps a function to the result of a state query.
	 * @param {Any} token - The client's token. Granted by the server.
	 * @param {String} name - The name of the server-side property.
	 * @param {Function} callback - The function to map to the result of the state query.
	 */
	omni.StateHandler.prototype.map = function(token, name, callback) {
		var obj = this;
		this.socket.emit(omni.GET_STATE, token, name, function(data) {
			var convertedData = convertChildProperties.call(obj, data)
			callback(data);
		});
	}

	/**
	 * @method set
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Sets a server-side state to a given value.
	 * @param {Any} token - The client's token. Granted by the server.
	 * @param {String} name - The name of the server-side property.
	 * @param {Any} value - The value the server-side property will be set to.
	 * @param {Function} callback - Called when the server sets the property to the specified value.
	 */
	omni.StateHandler.prototype.set = function(token, name, value, callback) {
		var obj = this;
		this.socket.emit(omni.SET_STATE, token, name, value, function(data) {
			var convertedData = convertChildProperties.call(obj, data);
			if(typeof callback !== "undefined") {
				callback(data);
			}
		});
	}

	/**
	 * @method get
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Returns a promise that results in the value of the server-side property.
	 * @param {Any} token - The client's token. Granted by the server.
	 * @param {String} name  The name of the server-side property.
	 * @returns {Promise} a promise that results in the value of the server-side property.
	 */
	omni.StateHandler.prototype.get = function(token, name) {

		var obj = this;
		var promise = new Promise(function(resolve, reject) {
			obj.socket.emit(omni.GET_STATE, token, name, function(data) {
				result = convertChildProperties.call(obj,data);
				resolve(result);
			})
		})

		return promise;
	}

	/**
	 * @method hook
	 * @public
	 * @memberof (client) omni.(client) StateHandler#
	 * @desc Establishes server to client databinding for the given state to a given client side object (AKA "hooking").
	 * @param {Any} token - The client's token. Granted by the server.
	 * @param {String} serverName - The name of the state as stored on the server.
	 * @param {Object} clientObject - The client side object that will contain the property.
	 * @param {String} clientName - The name of the property as stored on the client.
	 */
	omni.StateHandler.prototype.hook = function(token, serverName, clientObject, clientName) {
		var obj = this;

		this.socket.emit(omni.HOOK_STATE, token, serverName, function() {
			obj.clientPairsForHookedName[serverName] = {
				"object" : clientObject,
				"name" : clientName
			}
		});

	};
})();