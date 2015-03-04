(function() {
	omni.StateHandler = function(socket) {
		this.socket = socket;
		this.token = null;
		this.clientPairsForHookedName = {};

		var obj = this;
	};

	omni.StateHandler.prototype.onConnected = function() {
		this.socket.on(omni.HOOK_STATE, (function(propertyName, value) {

			var tokens = propertyName.split(".");
			var name = tokens[0];

			var pair = this.clientPairsForHookedName[name];

			var clientObject = pair.object;
			var clientName = pair.name;

			for (var i = 0; i < tokens.length - 1; i ++)
			{
				clientObject = clientObject[tokens[i]];
				clientName = tokens[i + 1];
			}

			clientObject[clientName] = value;

		}).bind(this));
	}

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
						console.log("this")
						console.log(propertyName);
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

	omni.StateHandler.prototype.map = function(token, name, callback) {
		var obj = this;
		this.socket.emit(omni.GET_STATE, token, name, function(data) {
			console.log("data is");
			console.log(data);
			var convertedData = convertChildProperties.call(obj, data)
			callback(data);
		});
	}

	omni.StateHandler.prototype.set = function(token, name, value, callback) {
		var obj = this;
		this.socket.emit(omni.SET_STATE, token, name, value, function(data) {
			var convertedData = convertChildProperties.call(obj, data);
			if(typeof callback !== "undefined") {
				callback(data);
			}
		});
	}

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