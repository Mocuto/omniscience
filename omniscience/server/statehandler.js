(function() {
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
		//TODO: Implement hooking
	}

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

	var convertHookedProperty = function(property) {
		var value = omni.clone(property.get());  //TODO: CLone this value instead

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

	omni.StateHandler.prototype.prepareSocket = function(socket) {
		var obj = this;

		console.log("Preparing socket");

		socket.on(omni.GET_STATE, function(token, propertyName, callback) {

			var property = obj.getProperty(propertyName);

			if(typeof callback === "undefined" || callback == null) {
				callback = function() {};
			}
			//callback = function() {console.log("I ran!")};

			if(property != null && token != null)
			{
				var value = property.get(token);

				if(Object.prototype.isPrototypeOf(value))
				{
					convertPropertyForClient(property, value);
				}
				//value.stateHandler = null;
				console.log(value);
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

	omni.StateHandler.prototype.addHookForProperty = function(property, socket, callback) {
		if(callback != null)
		{
			callback();			
		}

		var propertyName = property.fullName.substr("state.".length);
		this.hookedSocketsForProperty[propertyName].push(socket);

		console.log("Hooking: " + propertyName)



		var convertedProperty = convertHookedProperty(property)

		console.log(property.get());
		console.log(convertedProperty);
		socket.emit(omni.HOOK_STATE, propertyName, convertedProperty);

		for(var i = 0; i < property.childrenNames.length; i++)
		{
			var childName = property.childrenNames[i];

			/**
				We may want to change this so that the callback is passed to each consecutive call, 
				with the parameters changing each time
			**/

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

	omni.StateHandler.prototype.getProperty = function(propertyName) {
		if(typeof propertyName !== "string") {
			return null;
		}
		if(propertyName.length == 0) {
			return this.state;
		}
		var tokens = propertyName.split(".");
		console.log("tokens are: ");
		console.log(tokens);
		var currentProperty = this.state.value[tokens[0]];

		for(var i = 1; i < tokens.length; i++)
		{
			if(typeof currentProperty === "undefined") 
			{
				return null;
			}
			
			currentProperty = currentProperty.value[tokens[i]];
		}
		console.log(currentProperty);
		return currentProperty;
	}

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
		console.log("SubName is " + subName);
		this.hookedSocketsForProperty[subName] = [];

		if(containingProperty.isHooked == true)
		{
			newProperty.isHooked = true;
			this.hookedSocketsForProperty[subName] = this.hookedSocketsForProperty[containingProperty.fullName.substr("state.")];
		}

		this.properties[subName] = newProperty;
	}

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

	omni.StateHandler.prototype.updateHook = function(propertyName, property) {
		var subName = propertyName.substr("state.".length);
		console.log(this.hookedSocketsForProperty);
		var sockets = this.hookedSocketsForProperty[subName];

		console.log("Update hook");
		console.log(propertyName + " ");
		if(typeof sockets !== "undefined")
		{
			var convertedValue = convertHookedProperty(property);
			for(var i = 0; i < sockets.length; i++)
			{

				var socket = sockets[i];
				var result = socket.emit(omni.HOOK_STATE, subName, convertedValue);
				console.log("Updating " + subName + " " + convertedValue + " " + property.value + " ");
			}

		}
	}
})();