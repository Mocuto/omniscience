(function() {
	omni.Conscience = function(io, name) {
		this.io;
		this.name = name;
		this.cleanName = this.name.replace(" ", "-"); //We will almost definitely need to fix this line
		this.namespace = this.io.of(this.cleanName);

		this.thoughtRoom = omni.THOUGHT;
		this.stateRoom = omni.STATE;

		this.socketsForId = {};
		this.clients = [];
	}

	omni.Conscience.prototype.sendThought = function(data, receivers, name) {
		var thought = new omni.Thought(data, name, this.token, receivers);
		if(typeof receivers === "undefined" || receivers == null)
		{
			this.thoughtHandler.sendAll(thought)
		}
		else
		{
			for(var i = 0; i < receivers.length; i++)
			{
				var id = receivers[i];
				var socket = this.socketsForId[id];

				this.thoughtHandler.send(thought, socket);
			}
		}
	}
})();