(function() {
	omni.Conscience = function(name, token) {
		var thoughtNamespace = io("/" + name + "#" + omni.THOUGHT);
		this.thoughtNamespace = thoughtNamespace;

		var stateNamespace = io("/" + name + "#" + omni.STATE);
		this.stateNamespace = stateNamespace;

		this.name = name;
		this.token = null;
		var obj = this;
		this.thoughtHandler = new omni.ThoughtHandler(thoughtNamespace);

		this.thoughtNamespace.on("connect", function() {
			obj.requestToken();
			obj.onConnected();
		})
	}

	omni.Conscience.prototype.requestToken = function() {
		var obj = this;
		this.thoughtNamespace.emit(omni.REQUEST_TOKEN, "test", function(token) {
			obj.token = token;
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
})();