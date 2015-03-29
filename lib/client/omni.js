/**
 * @namespace (client) omni
 */

 /**
  * @method init
  * @memberof (client) omni
  *
  * @desc Creates the socket.io instance
  */
omni.init = function(host) {
	host = (typeof host === "undefined") ? "" : host;

	omni.host = host;
	omni.socket = io(host);
}


/**
 * @method conscience
 * @memberof (client) omni
 *
 * @desc Creates a Conscience instance with the given name
 * @param {String} name - The name of the Conscience instnace
 * @returns {omni.Conscience} - The Conscience instance
 * @see {@link (client) Conscience}
 */
omni.conscience = function(name) {
	
	var conscience = new omni.Conscience(name, omni.token);

	return conscience;
}