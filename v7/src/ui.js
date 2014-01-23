AJILE.define('ui', function() {	
	var exports = {};

	var Class = exports.Class = {
		add: function(node, newClass) {
			if (~(' '+node.className).indexOf(' '+newClass)) 
				return true, node.className += ' ' + newClass;
			return false;	
		},

		remove: function(node, classToRemove) {
			if ((new RegExp(classToRemove)).test(node.className))
				return (node.className = node.className.replace(classToRemove, ''));
			return false;
		},

		toggle: function(node, toggleClass) {
			if (Class.remove(node, toggleClass))
				return false;
			else
				return Class.add(node, toggleClass);
		},

		has: function(node, checkClass) {
			return ~(' '+node.className).indexOf(' '+checkClass);
		}
	};

	var setContent = exports.setContent = function(node, content, needsSanitize) {
		if (!needsSanitize) { 
			content = content.replace(/</g, '&lt;').
				replace(/>/, '&gt;').
				replace(/\"/, '&quot;'); 
		}
		node.innerHTML = content;
	};

	return exports;
})();