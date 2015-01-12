(function() {
	omni.StateHandler = function(socket) {
		this.socket = socket;
		this.token = null;
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
		// TODO: Handle hooking
	};
})();