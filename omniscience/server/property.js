(function() {
	omni.Property = function(name, getFunction, setFunction, initialValue) {
		this.name = name;
		var _value = initialValue;
		this.get = getFunction;
		this.set = setFunction;

		this.isHooked = false;
		this.__defineSetter__("value", function(newValue) {
			//TODO: Handle hooking here
			_value = newValue;
		})

		this.__defineGetter__("value", function() {
			return _value;
		});

		if(typeof this.get === "undefined" || this.get == null) {
			this.get = function(token) {
				return this.value;
			}
		}
		if(typeof this.set === "undefined" || this.set == null) {
			this.set = function(token, value) {
				throw "Setter is undefined for property: " + name + "! By default trying to set "
			}
		}
	}
})();