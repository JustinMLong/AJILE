AJILE.define('dom', function() {
	var exports = {};
	
	exports.node = function(tag, subNodes, attr) {
		var attr = attr || {}, 
			subNodeSet = (subNodes == null || !Array.isArray(subNodes)) ? [subNodes] : subNodes,
			tmpTag = document.createElement(tag);
		
		Object.keys(attr).forEach(function(att) { tmpTag[att] = attr[att]; });
		subNodeSet.forEach(function(childEle) { 
			if (!childEle) return;
			
			if (typeof childEle == 'string')
				tmpTag.appendChild(document.createTextNode(childEle));
			else
				tmpTag.appendChild(childEle);
		});
		return tmpTag;
	};

	return exports;

 } };
