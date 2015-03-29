(function() {

	/**
	 *  @class (server) Property
	 *  @classdesc A server-side property to be synced across multiple clients. Has getter and setter functions.
	 *  @param {name} name - The name of the property.
	 *  @param {Function} getFunction - The function that is called when the client attempts to get the property's value.
	 *  @param {Function} setFunction - The function that is called when the client attempts to set the property's value.
	 *  @param {Any} initialValue - The initial value of the property.
	 *  @param {omni.StateHander} stateHandler - The StateHandler that will communicate regarding this property.
	 *  @memberof (server) omni
	*/
	omni.Property = function(name, getFunction, setFunction, initialValue, stateHandler) {
		this.name = name;
		this.fullName = name;

		Object.defineProperty(this, "stateHandler", {
			configurable : true,
			enumerable : false,
			get : function() {
				return stateHandler
			}
		});

		this.childrenNames = [];

		var _value = initialValue;
		this.get = getFunction;
		this.set = setFunction;

		this.isHooked = false;
		this.hookedSockets = [];

		var obj = this;

		Object.defineProperty(this, "value", 
		{
			configurable : true,
			enumerable : false,
			get : function() {
				//TODO: Handle hooking here
				return _value;
			},
			set : function(newValue) {
				_value = newValue;

				if(obj.isHooked == true)
				{

					obj.stateHandler.updateHook(obj.fullName, obj);
				}
			}
		})

		if(typeof this.get === "undefined" || this.get == null) {
			this.get = function(token) {
				return this.value;
			}
		}
		if(typeof this.set === "undefined" || this.set == null) {
			this.set = function(token, value) {
				throw "Setter is undefined for property: " + name + "! By default clients cannot set the value"
			}
		}
	}
	/**
	 * @method addHock
	 * @public
	 * @memberof (server) omni.(server) Property#
	 * @desc Hooks this property to the client connected on the given socket
	 * @param {Socket} socket - The socket that handles communication with that client.
	 */
	omni.Property.prototype.addHook = function(socket) {
		this.hookedSockets.push(socket);
	}

})();