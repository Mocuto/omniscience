require("../dependencies/Math.uuid.js")
require("../shared/omni.js")
require("../shared/thought.js")

require("./thoughthandler.js")
require("./conscience.js")

omni.init = function(io) {
	omni.io = io;
	omni.consciences = {};
}

omni.conscience = function(name) {
	var conscience = new omni.Conscience(omni.io, name);
	omni.consciences[name] = conscience;

	return conscience;
}

module.exports = omni;
