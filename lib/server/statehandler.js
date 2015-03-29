(function() {

	/**
	 *  @class (server) StateHandler
	 *  @classdesc Handles communicating with clients regarding state.
	 *  @param {Socket} namespaceSocket - The socket with which to communicate with all clients.
	 *  @param {Dictionary} sockets - A dictionary mapping client identifiers to their corresponding sockets.
	 *  @param {omni.Property} state - The default state the handler will start with.
	 *  @memberof (server) omni
	*/
	omni.StateHandler = function(namespaceSocket, sockets, state) {
		this.io = namespaceSocket;
		this.sockets = sockets;
		this.state = state;
		this.hookedSocketsForProperty = {};

		var obj = this;
		this.io.on("connection", function(socket) {
			obj.prepareSocket(socket);
		})

		this.properties = {};
	}

	/**
	 * @method convertPropertyForClient
	 * @private
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Converts the given property with its given value such that it and its child omni.Property instances represent their stored value.
	 * @param {omni.Property} property - The property to convert.
	 * @param {Any} value - The value of that property.
	 */
	var convertPropertyForClient = function(property, value) {
		value.__omniChildPropertyNames = [];
		for(var i = 0; i < property.childrenNames.length; i++) {
			var childName = property.childrenNames[i];
			value[childName].__isOmniProperty = true;
			value.__omniChildPropertyNames.push(childName)

			var childValue = value[childName].value;

			if(Object.prototype.isPrototypeOf(childValue))
			{
				convertPropertyForClient(value[childName], childValue);
			}
		}
	}

	/**
	 * @method convertHookedProperty
	 * @private
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Converts the given property for hooking such that the values are cloned.
	 * @param {omni.Property} property - The property to convert.
	 * @param {Any} value - The value of that property.
	 */
	var convertHookedProperty = function(property) {
		var value = omni.clone(property.get());

		if(Object.prototype.isPrototypeOf(value))
		{
			for(var i = 0; i < property.childrenNames.length; i++)
			{
				var childName = property.childrenNames[i];

				value[childName] = convertHookedProperty(property.value[childName]);
			}
		}

		return value;
	}

	/**
	 * @method prepareSocket
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Adds the get state, set state, and hook callbacks for the given socket, thus preparing it for use within the StateHandler.
	 * @param {Socket} socket - The socket to prepare.
	 */
	omni.StateHandler.prototype.prepareSocket = function(socket) {
		var obj = this;

		socket.on(omni.GET_STATE, function(token, propertyName, callback) {

			var property = obj.getProperty(propertyName);

			if(typeof callback === "undefined" || callback == null)
			{
				callback = function() {};
			}

			if(property != null && token != null)
			{
				var value = property.get(token);

				if(Object.prototype.isPrototypeOf(value))
				{
					convertPropertyForClient(property, value);
				}
				callback(value);
			}
			else
			{
				if(token == null)
				{
					callback({error: "Token is null. Please provide a token"})
				}
				else
				{
					callback(null);
				}
			}
		})

		socket.on(omni.SET_STATE, function(token, propertyName, value, callback) {
			if(typeof callback === "undefined" || callback == null)
			{
				callback = function() {};
			}

			var property = obj.getProperty(propertyName);
			if(property != null && token != null)
			{
				property.set(token, value);
				callback(true);
			}
			else
			{
				callback(false);
			}
		})

		socket.on(omni.HOOK_STATE, (function(token, propertyName, callback) {
			var property = obj.getProperty(propertyName);

			if(property != null && propertyName in obj.hookedSocketsForProperty)
			{
				obj.addHookForProperty(property, socket, callback);
			}

		}).bind(this));

		socket.on(omni.UNHOOK_STATE, function(token, propertyName, callback) {
			var property = obj.getProperty(propertyName);
			if(property != null) {
				var index = obj.hookedSocketsForProperty[propertyName].indexOf(socket);

				if(index != -1) {
					obj.hookedSocketsForProperty[propertyName].splice(index, 1);

					if(obj.hookedSocketsForProperty[propertyName].length == 0) {
						property.isHooked = false;						
					}
				}

				callback();
			}
		});
	}

	/**
	 * @method addHookForProperty
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Adds the get state, set state, and hook callbacks for the given socket, thus preparing it for use within the StateHandler.
	 * @param {omni.Property} property - The property to hook.
	 * @param {Socket} socket - The client socket that is participating in the hooking.
	 * @param [Function] callback - A callback to execute upon begining the routine.
	 */
	omni.StateHandler.prototype.addHookForProperty = function(property, socket, callback) {
		if(callback != null)
		{
			callback();			
		}

		var propertyName = property.fullName.substr("state.".length);
		this.hookedSocketsForProperty[propertyName].push(socket);

		var convertedProperty = convertHookedProperty(property)

		socket.emit(omni.HOOK_STATE, propertyName, convertedProperty);

		for(var i = 0; i < property.childrenNames.length; i++)
		{
			var childName = property.childrenNames[i];

			/*
				We may want to change this so that the callback is passed to each consecutive call, 
				with the parameters changing each time
			*/

			this.addHookForProperty(property.value[childName], socket, null);
		}

		if(property.isHooked == true)
		{
			return;
		}
		else 
		{

			property.isHooked = true;
		}
		

	}

	/**
	 * @method getProperty
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Returns the property with the given name, or null if it is not found.
	 * @param {String} propertyName - The name of the property to return.
	 * @returns {omni.Property} The property with the given name
	 */
	omni.StateHandler.prototype.getProperty = function(propertyName) {
		if(typeof propertyName !== "string") {
			return null;
		}
		if(propertyName.length == 0) {
			return this.state;
		}
		var tokens = propertyName.split(".");
		var currentProperty = this.state.value[tokens[0]];

		for(var i = 1; i < tokens.length; i++)
		{
			if(typeof currentProperty === "undefined") 
			{
				return null;
			}
			
			currentProperty = currentProperty.value[tokens[i]];
		}
		return currentProperty;
	}

	/**
	 * @method addProperty
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Adds a new property with the given name and options to a specified containing property.
	 * @param {omni.Property} containingProperty - The parent property for the new property.
	 * @param {String}  name - The name of the new property.
 	 * @param {Object} options - The options with which to create the property.
	 * @param {Function} options.get - The get function of that property.
	 * @param {Function} options.set - The set function of that property.
	 * @param {Any} options.value - The default value of that property.
	 * @returns The new omni.Property instance.
	 */
	omni.StateHandler.prototype.addProperty = function(containingProperty, name, options) {

		var newProperty = new omni.Property(name, options.get, options.set, options.value, this);
		newProperty.fullName = containingProperty.fullName + "." + name;

		containingProperty.value[name] = newProperty;
		containingProperty.childrenNames.push(name);

		//Define getter and setter on containingProperty
		Object.defineProperty(containingProperty, name,
			{
				configurable : true,
				enumerable : true,

				get : function() {
					return newProperty.value;
				},
				set : function(newValue) {
					newProperty.value = newValue;
				}
			}
		);

		var subName = newProperty.fullName.substr("state.".length);
		this.hookedSocketsForProperty[subName] = [];

		if(containingProperty.isHooked == true)
		{
			newProperty.isHooked = true;
			this.hookedSocketsForProperty[subName] = this.hookedSocketsForProperty[containingProperty.fullName.substr("state.")];
		}

		this.properties[subName] = newProperty;

		return newProperty;
	}

	/**
	 * @method removeProperty
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Removes the property with the given name from the paren property.
	 * @param {omni.Property} containingProperty - The parent property of the property to remove.
	 * @param {String}  name - The name of the property to remove.
	 */

	omni.StateHandler.prototype.removeProperty = function(containingProperty, name) {
		var prop = containingProperty.value[name];

		if(typeof prop === "undefined" || prop == null)
		{
			return;
		}

		var subName = prop.fullName.substr("state.".length);

		delete this.properties[prop.fullName];

		if(containingProperty.isHooked == true)
		{
			delete this.hookedSocketsForProperty[subName];
		}

		//Define getter and setter on containingProperty
		Object.defineProperty(containingProperty, name,
			{
				configurable : true,
				enumerable : false,

				get : undefined,
				set : undefined
			}
		);

		var index = containingProperty.childrenNames.indexOf(name);
		if(index != -1)
		{
			containingProperty.childrenNames.splice(index, 1);
		}
	}

	/**
	 * @method updateHook
	 * @public
	 * @memberof (server) omni.(server) StateHandler#
	 * @desc Removes the property with the given name from the paren property.
	 * @param {String}  propertyName - The name of the property that is being updated on the client side.
	 * @param {omni.Property} property - The property that has been updated on the server side.
	 */

	omni.StateHandler.prototype.updateHook = function(propertyName, property) {
		var subName = propertyName.substr("state.".length);
		console.log(this.hookedSocketsForProperty);
		var sockets = this.hookedSocketsForProperty[subName];

		if(typeof sockets !== "undefined")
		{
			var convertedValue = convertHookedProperty(property);
			for(var i = 0; i < sockets.length; i++)
			{
				var socket = sockets[i];
				var result = socket.emit(omni.HOOK_STATE, subName, convertedValue);
			}

		}
	}
})();