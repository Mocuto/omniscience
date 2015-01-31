(function() {
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

		//this.stateHandler = stateHandler;

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

				if(obj.isHooked == true) {

					obj.stateHandler.updateHook(obj.fullName, newValue);
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

	omni.Property.prototype.addHook = function(socket) {
		this.hookedSockets.push(socket);
	}

})();