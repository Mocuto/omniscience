omni.init = function() {
	omni.socket = io();
}

omni.conscience = function(name) {
	
	var conscience = new omni.Conscience(name, omni.token);

	return conscience;
}