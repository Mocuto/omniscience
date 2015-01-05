(function() {
	omni.StateHandler = function(namespaceSocket, sockets, state) {
		this.io = namespaceSocket;
		this.sockets = sockets;
		this.state = state;

		var obj = this;
		this.io.on("connect", function(socket) {
			obj.prepareSocket(socket);
		})

		//TODO: Implement hooking
	}

	omni.StateHandler.prototype.prepareSocket = function(socket) {
		var obj = this;

		socket.on(omni.GET_STATE, function(token, propertyName, callback) {
			var property = obj.getProperty(propertyName);

			if(property != null && token != null)
			{
				callback(property.get(token));
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
			var property = obj.getProperty(propertyName);
			if(property != null && token != null) {
				property.set(token, value);
				callback(true);
			}
			else {
				callback(false);
			}
		})
	}

	omni.StateHandler.prototype.getProperty = function(propertyName) {
		var tokens = propertyName.split(".");
		var currentProperty = this.state[tokens[0]];

		for(var i = 1; i < tokens.length; i++) {
			currentProperty = currentProperty.value[tokens[i]];

			if(typeof currentProperty === "undefined") 
			{
				return null;
			}
		}
		return currentProperty;
	}
})();