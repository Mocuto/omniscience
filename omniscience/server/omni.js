/**
 * @namespace (server) omni
 */

require("../dependencies/Math.uuid.js")
require("../shared/omni.js")
require("../shared/thought.js")

require("./property.js")
require("./statehandler.js")
require("./thoughthandler.js")
require("./conscience.js")


 /**
  * @method init
  * @memberof (server) omni
  *
  * @desc Creates the socket.io instance
  */
omni.init = function(io) {
	omni.io = io;
	omni.consciences = {};
}

/**
 * @method conscience
 * @memberof (server) omni
 *
 * @desc Creates a Conscience instance with the given name
 * @param {String} name - The name of the Conscience instnace
 * @returns {omni.Conscience} - The Conscience instance
 * @see {@link (server) Conscience}
 */
omni.conscience = function(name) {

	if(name in omni.consciences == false) {
		var conscience = new omni.Conscience(omni.io, name);
		omni.consciences[name] = conscience;
	}

	return omni.consciences[name];
}

module.exports = omni;
