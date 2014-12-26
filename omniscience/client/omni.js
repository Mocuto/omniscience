omni.init = function() {
	omni.socket = io();
}

omni.conscience = function(name) {
	var namespace = io("/" + name);

	var conscience = new omni.Conscience(namespace, name, omni.token);

	return conscience;
}