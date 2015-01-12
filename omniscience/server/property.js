(function() {
	omni.Property = function(name, getFunction, setFunction, initialValue) {
		this.name = name;
		this.fullName = name;
		this.childrenNames = [];

		var _value = initialValue;
		this.get = getFunction;
		this.set = setFunction;

		this.isHooked = false;
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

})();