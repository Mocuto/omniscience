omni.init = function() {
	omni.io = io();
	omni.token = null;
	omni.requestToken();
}

omni.requestToken = function() {
	omni.io.emit(omni.REQUEST_TOKEN, "", function(token) {
		omni.token = token;
	})
}

omni.conscience = function(name) {
	if(omni.token == null) {
		throw "This omniscience instance has no token. Make sure you've called omni.init"
	}
	var namespace = io.of(name);
	namespace.join(omni.THOUGHT);
	namespace.join(omni.STATE);

	var conscience = new omni.Conscience(namespace, name, omni.token)
}