(function() {
	omni.StateHandler = function(namespaceSocket, sockets, state) {
		this.io = namespaceSocket;
		this.sockets = sockets;
		this.state = state;

		var obj = this;
		this.io.on("connect", function(socket) {
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

	omni.StateHandler.prototype.prepareSocket = function(socket) {
		var obj = this;

		socket.on(omni.GET_STATE, function(token, propertyName, callback) {
			var property = obj.getProperty(propertyName);

			if(typeof callback === "undefined" || callback == null) {
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
			if(typeof callback === "undefined" || callback == null) {
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

	omni.StateHandler.prototype.addProperty = function(object, name, options) {

		var newProp = new omni.Property(name, options.get, options.set, options.value);
		newProp.fullName = object.fullName + "." + name;

		object.value[name] = newProp;
		object.childrenNames.push(name);

		//Define getter and setter on object
		Object.defineProperty(object, name,
			{
				configurable : true,
				enumerable : true,

				get : function() {
					return newProp.value;
				},
				set : function(newValue) {
					newProp.value = newValue;
				}
			}
		);

		if(object.isHooked == true)
		{
			//TODO: Handle hooking here, if the parentProperty is hooked		
		}

		this.properties[newProp.fullName] = newProp;
	}

	omni.StateHandler.prototype.removeProperty = function(object, name) {
		var prop = object.value[name];

		if(typeof prop === "undefined" || prop == null)
		{
			return;
		}

		delete this.properties[prop.fullName];
		//Define getter and setter on object
		Object.defineProperty(object, name,
			{
				configurable : true,
				enumerable : false,

				get : undefined,
				set : undefined
			}
		);

		var index = object.childrenNames.indexOf(name);
		if(index != -1) {
			object.childrenNames.splice(index, 1);
		}

		if(object.isHooked == true)
		{
			//TODO: Handle hooking here, if the parentProperty is hooked		
		}
	}
})();