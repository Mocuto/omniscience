/**
 * The Omniscience namespace
 * @namespace omni
 */

omni = {}

/** 
 * @static 
 * @type {String}
 */
omni.THOUGHT = "thought";

/** 
 * @static
 * @type {String} 
 */
omni.STATE = "state";

/** 
 * @static
 * @type {String} 
 */
omni.REQUEST_TOKEN = "request-token";
/** 
 * @static
 * @type {String} 
 */
omni.TOKEN_GRANTED = "token-granted";

/** 
 * @static
 * @type {String} 
 */
omni.GET_STATE = "get-state"
/** 
 * @static
 * @type {String} 
 */
omni.SET_STATE = "set-state";
/** 
 * @static
 * @type {String} 
 */
omni.HOOK_STATE = "hook-state";
/** 
 * @static
 * @type {String} 
 */
omni.UNHOOK_STATE = "unhook-state";

/** 
 * @static
 * @type {Number} 
 */
omni.GET_TIMEOUT = 3000;

/** 
 * @static
 * @type {String} 
 */
omni.SERVER = "server";


/**
 * @method getCleanNameForNamespace
 * @memberof omni
 * 
 * @desc Gets a clean name for a socket.io namespace
 * @param {String} name - The original name
 * @returns {String} Clean name for the namespace
 */
omni.getCleanNameForNamespace = function(name) {
	return name.replace(" ", "-"); //We will almost definitely need to fix this line
}

/**
 * @method getNameForNamespace
 * @memberof omni
 *
 * @desc Gets the name of the namespace for a particular type of socket communication
 * @param {String} name - The (clean) base name for the namespace
 * @param {String} type - The type of the socket communication, typically either "thought" or "state"
 * @returns {String} The name for that particular type of socket communication
 */

omni.getNameForNamespace = function(name, type) {
	return "/" + name + "__" + type
}

/**
 * @method clone
 * @memberof omni
 *
 * @desc Clones an object
 * @param {Object} object - The Object to clone
 * @returns A clone
 */

omni.clone = function (object) {
        if (object == null || typeof object != 'object') {
            return object;
        }
        try 
        {
        	var temp = new object.constructor(); // give temp the original obj's constructor
        	for (var key in object)
        	{
                temp[key] = omni.clone(object[key]);
            }
        }
        catch (err)
        {
            console.log("Error caught: " + err.message);
            console.log("Key is: " + key);
        }
        return temp;
    };