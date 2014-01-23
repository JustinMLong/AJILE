AJILE.event = (function() {

		bind: function(obj,type,fn) {
		if (Array.isArray(obj)) { obj.forEach(function(obj) { AJILE.bind(obj, type, fn); }) }
		if (Array.isArray(type)) { type.forEach(function(type) { AJILE.bind(obj, type, fn); }) }

		if (obj.addEventListener) 
			{ obj.addEventListener(type, fn, false); }
		else if (obj.attachEvent) 
			{ obj.attachEvent('on'+type,fn); }
		else 
			{ obj['on'+type] = fn; }
		return obj;
	},

	unbind: function(obj,type,fn) {
		if (Array.isArray(obj)) { obj.forEach(function(obj) { AJILE.unbind(obj, type, fn); }) }
		if (Array.isArray(type)) { type.forEach(function(type) { AJILE.unbind(obj, type, fn); }) }

		if (obj.removeEventListener) 
			{ obj.removeEventListener(type, fn, false); }
		else if (obj.detachEvent) 
			{ obj.detachEvent('on'+type,fn); }
		else 
			{ obj['on'+type] = function() {}; }
		return obj;
	}, 
	
	var exports = {}, topics = {}, subUid = -1;

	var publish = exports.publish = function(topic, args) {
	if (!topics[topic])
		return false;
 
	setTimeout(function() {
		var subscribers = topics[topic], len = subscribers ? subscribers.length : 0;

		while (len--) { subscribers[len].func(topic, args); }
	}, 0);

	return true;
	};
 
	var subscribe = exports.subscribe = function(topic, func) {
		var token = (++subUid).toString();
		topics[topic] = topics[topic] || [];

		topics[topic].push({ token: token, func: func });
		return token;
	};
 
	var unsubscribe = exports.unsubscribe = function(token) {
	Object.keys(topics).forEach(function(topic) {
		topic.forEach(function(subTopic, location) {
		if (subTopic.token == token)
			return topic.splice(location, 1), token;
		});
	});
	return false;
	};

	return exports;
})();
