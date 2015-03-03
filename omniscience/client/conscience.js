(function() {
	omni.Conscience = function(name, token) {
		this.name = name;
		this.token = null;

		this.cleanName = omni.getCleanNameForNamespace(name);

		var thoughtNamespace = io(omni.getNameForNamespace(this.cleanName, omni.THOUGHT));
		this.thoughtNamespace = thoughtNamespace;

		var stateNamespace = io(omni.getNameForNamespace(this.cleanName, omni.STATE));
		this.stateNamespace = stateNamespace;


		var obj = this;
		this.thoughtHandler = new omni.ThoughtHandler(thoughtNamespace);

		this.thoughtNamespace.on("connect", function() {
			obj.requestToken();
			obj.onConnected();
		})

		this.stateNamespace.on("connect", (function() {
			this.stateHandler.onConnected()
		}).bind(this));

		this.stateHandler = new omni.StateHandler(stateNamespace);
	}

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

	omni.Conscience.prototype.onConnected = function() {
		//This function is to be overwritten
	}

	omni.Conscience.prototype.onTokenGranted = function() {
		//This function is to be overwritten
	}

	omni.Conscience.prototype.onThought = function(name, callback, callee) {
		this.thoughtHandler.on(name, callback, callee);
	}

	omni.Conscience.prototype.sendThought = function(data, name, receivers, callback) {
		if(this.token == null) {
			return;
		}
		var thought = new omni.Thought(data, name, this.token, receivers);
		this.thoughtHandler.send(thought, callback)
	}

	omni.Conscience.prototype.getState = function(name, callback) {
		this.stateHandler.map(this.token, name, callback);
	}

	omni.Conscience.prototype.setState = function(name, value, callback) {
		this.stateHandler.set(this.token, name, value, callback);
	}

	omni.Conscience.prototype.hook = function(serverName, clientObject, clientName) {
		this.stateHandler.hook(this.token, serverName, clientObject, clientName);
	}
})();