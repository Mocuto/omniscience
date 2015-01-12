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
					var obj = this;
					var property = data[childName];
					Object.defineProperty(data, childName, {
						enumerable : true,
						get : function() {
							return obj.get(obj.token, property.fullName);
						},
						set : function(newValue) {
							obj.set(obj.token, property.fullName, newValue);
						}
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
			callback(data);
		});
	}

	omni.StateHandler.prototype.get = function(token, name) {
		var container = {result :
		var result = null;
		var retrieved = false;
		var timedOut = false;

		console.log(omni.GET_TIMEOUT);
		var timeoutIndex = setTimeout(function() {
			timedOut = true;
		}, omni.GET_TIMEOUT)

		this.socket.emit(omni.GET_STATE, token, name, function(data) {
			result = convertChildProperties(data);
			retrieved = true;
		})

		if (timedOut == true)
		{
			throw "omni.StateHandler.prototype.get timed out for name: " + name;
		}

		return result;
	}

	omni.StateHandler.prototype.hook = function(token, serverName, clientObject, clientName) {
		// TODO: Handle hooking
	};
})();