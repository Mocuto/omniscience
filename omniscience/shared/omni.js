omni = {}

omni.THOUGHT = "thought";
omni.STATE = "state";

omni.REQUEST_TOKEN = "request-token";
omni.TOKEN_GRANTED = "token-granted";

omni.GET_STATE = "get-state"
omni.SET_STATE = "set-state";
omni.HOOK_STATE = "hook-state";
omni.UNHOOK_STATE = "unhook-state";

omni.GET_TIMEOUT = 3000;

omni.getCleanNameForNamespace = function(name) {
	return name.replace(" ", "-"); //We will almost definitely need to fix this line
}

omni.getNameForNamespace = function(name, type) {
	return "/" + this.cleanName + "__" + omni.THOUGHT
}

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