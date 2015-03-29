(function() {

	/**
	 *  @class Thought
	 *  @classdesc A fire-and-forget message.
	 *  @param {Any} content - The content of the message.
	 *  @param {String} name - The name of the thought. Used to match callbacks to specific names.
	 *  @param {Any} sender - The unique token of the sender.
	 *  @param {Array} receiver - An array of unique tokens specifying the recipients' unique identifier.
	 *  @memberof omni
	*/
	omni.Thought = function(content, name, sender, receiver) {
		this.content = content;
		this.name = name;
		this.sender = sender;
		this.receiver = receiver;
	}
})();