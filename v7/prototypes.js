(function() {
	//Array
	var arrP = Array.prototype;
	if (!('forEach' in arrP)) Array.prototype.forEach = function(fn, that ) { 
			for (var i=0; i<this.length; i++) if (i in this) fn.call(that, this[i], i, this);
	};

	if (!('map' in arrP)) Array.prototype.map = function(action, that) { 
		var tmpArr = []; for (var i=0; i<this.length; i++) 
			{ tmpArr.push(action.call(that, this[i], i, this)); }
		return tmpArr; 
	}; 

	if (!('filter' in arrP)) Array.prototype.filter = function (action, that) { 
		var tmpArr = []; for (var i=0; i < this.length; i++) 
			 { if (i in this && action.call(that, this[i], i, this)) tmpArr.push(this[i]); }
		return tmpArr; 
	}; 

	if (!('indexOf' in arrP)) Array.prototype.indexOf = function (ele, beginLoc) { 
		for (var i=(beginLoc||0); i < this.length; i++) {if (ele === this[i]) return i;} return -1; 
	};

	if (!('reduce' in arrP)) Array.prototype.reduce = function (action, initLoc) {
		var tmpArr = []; for (var i=(initLoc||0); i < this.length; i++)
			tmpArr = action.call(undefined, tmpArr, this[i], i, this);
		return tmpArr;
	};

	if (!('some' in arrP)) Array.prototype.some = function (action, that) {
		var isTrue = false; for (var i=0; i < this.length; i++) isTrue = action.call(that, this[i], i, this);
		return isTrue;
	};

	if (!('every' in arrP)) Array.prototype.every = function (action, that) {
		for (var i=0; i < this.length; i++) if (!action.call(that, this[i], i, this)) return false; 
		return true;
	};
	if (!('isArray' in Array)) Array.isArray = function (obj) {	
		return (typeof obj == 'object' && /array/i.test(obj.constructor)); 
	};

	//String
	if (!('trim' in String.prototype)) String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,''); };

	//Object
	if (!('keys' in Object)) Object.keys = function(obj) { 
		var keys = []; for (var props in obj) obj.hasOwnProperty(props) && keys.push(props); return keys; 
	}; 

	var _st = window.setTimeout;
	var setTimeout = function(fRef, mDelay) {
		if(typeof fRef == "function") {
			var argu = Array.prototype.slice.call(arguments,2), f = (function(){ fRef.apply(null, argu); });
			return _st(f, mDelay);
		}
		return _st(fRef,mDelay);
	};
	window.setTimeout = setTimeout;

})();