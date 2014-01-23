AJILE.define('styles', function(dom) {
	var exports = {};
	
	[{tag: 'ccint', style: 'display: '+(AJILE.isInternal?'block':'none')}, 
		 {tag: 'ccext', style: 'display: '+(AJILE.isExternal?'block':'none')},
		 {tag: '#navigation li > ccint', style: 'display: '+(AJILE.isInternal?'inline-block':'none')}, 
		 {tag: '#navigation li > ccext', style: 'display: '+(AJILE.isExternal?'inline-block':'none')},].
		forEach(function(st) { AJILE.require('styles'); AJILE.styles.add(st.tag, st.style, 'Int/Ext') })

	document.head.appendChild(dom.style(null, {type: 'text/css'});
	
	var styleSheet = document.styleSheets[document.styleSheets.length-1]);

	
	styleSheet.cssRules || (styleSheet.cssRules = styleSheet.rules);
	styleSheet.deleteRule || (styleSheet.deleteRule = styleSheet.removeRule);
	styleSheet.addRule || (styleSheet.addRule = (function(sel, nStyle) { styleSheet.insertRule(sel+' {'+nStyle+'}', styleSheet.cssRules.length);});

	var Style = function(selector, styles, tag) 
		{ return { index: null, 'selector': selector, 'style': styles, 'tag': (tag||'').split(',') }; };
	var Connector = function(idx, sel)
		{ return { index: idx, selector: sel}; };

	var add = exports.add = function(selector, style, tag) {
		var styleObj = (selector.selector) ? selector : new Style(selector, style, tag);
		if (styles[styleObj.selector]) { change(styleObj); }
		else {
			styleSheet.appendRule(styleObj.selector, styleObj.style);
			styles[styleObj.selector] = styleObj;
			styles[styleObj.selector].index = styleSheet.cssRules.length-1;
			ssConnector.push(new Connector(styles[styleObj.selector].index, styleObj.selector));
		}
	};

	var change = exports.change = function(selector, style, tag) {
		var styleObj = (selector.selector) ? selector : new Style(selector, style, tag);
		if (!styles[styleObj.selector]) { return false; }
		styleSheet.cssRules[styles[styleObj.selector].index].style.cssText = styleObj.style;
		styleObj.index = styles[styleObj.selector].index;
		styles[styleObj.selector] = styleObj;
	};

	var remove = exports.remove = function(selector) {
		if (!styles[selector]) { return false; }
		styleSheet.deleteRule(styles[selector].index);
		ssConnector.remove(styles[selector].index);
		styles[selector] = null;
		delete styles[selector];
	};
	
	var removeByTag = exports.removeByTag = function(tag) {
		ssConnector.valueOf().map(function(style) { return styles[style.selector]; }).
			filter(function(style) { return ~style.tag.indexOf(tag) }).
			forEach(function(style) { remove(style.selector); });
	};

	return exports;
} };