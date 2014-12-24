(function() {
	omni.Conscience = function(namespace, name, token) {
		this.namespace = namespace;
		this.name = name;
		this.token = token;
		this.thoughtHandler = new omni.ThoughtHandler(namespace);
	}
	omni.Conscience.prototype.onThought = function(name, callback, callee) {
		this.thoughtHandler.on(name, callback, callee);
	}

	omni.Conscience.prototype.sendThought = function(data, receivers, name) {
		var thought = new omni.Thought(data, name, this.token, receivers);
		this.thoughtHandler.send(thought)
	}
})();