/**
 * @author - Justin Long, Workscape, an ADP Company
 * @version 7.70
 * AJILE - Async Javascript Incremental Loading Environment is a rich environment
 * for the Workscape call center.  It provides modularity and ways for fast loading
 * of knowledgebase pages
 * 
 */

var sandbox = {
	blocking: function(id)
	{document.getElementById(id).style.display = (document.getElementById(id).style.display == 'none')?'block':'none';}
};
blocking = sandbox.blocking;


function OrganizedList(ChF) {
	var that = this, back = [], chanFun = ChF;

	this.push = function(ele) 
		{ back[back.length] = ele; chanFun.apply(null, [ele, back.length-1, back]); return ele; };
	this.pop = function()
		{ return back.pop(); };
	this.remove = this.add = function(idx, ele) { 
		var ret = (ele == null)?(back.length,back.splice(idx,1)[0]):(back.length+1,back.splice(idx,0,ele),ele);
		for (; idx < back.length; idx++) 
			{ chanFun.apply(null, [back[idx], idx, back]); }
		return ret;
	};
	this.peek = function() { return back[back.length-1]; };
	this.check = function(idx) { return back[idx]; };
	this.valueOf = function() 
		{ return back.slice(0); }
};


function isElement(node) 
	{ return node.nodeType == 1; }


String.prototype.matchCount = function(regxp)
	{ return (this.match(regxp)?this.match(regxp).length:0); };

String.prototype.getInnerHtml = function(tag) {
	var attr = (!!arguments[1])? ' '+arguments[1]: '', TAtL = tag.length+attr.length;
	if (this.indexOf('<'+tag+attr+'>') != -1 && this.lastIndexOf('</'+tag+'>') != -1)
		{return this.substring((this.indexOf('<'+tag+attr+'>')+TAtL+2),this.lastIndexOf('</'+tag+'>'));}
	else
		{return this;}
};

RegExp.escapeText = function(text) {
	var specials = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ];
	var sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

	return text.replace(sRE, '\\$1');
};


var AJILE = (function() {

	var exports = {};
	var properties = {};
	
	/**
	 * 
	 * Provides a system-wide value as a property (can be overwritten by the user).
	 *
	 * @param property the property to set / retrieve
	 * @param value    the value of the default of the property
	 * @return str     the value of the property
	 * 
	 */
	var define = exports.define = function (property, value/*, function def */) {
		var prop = properties, subProp = property.split('.')[property.split('.').length-1];
		property.split('.').forEach(function(subProp, itr, arr) {
			if (itr != arr.length-1)
				prop = (prop[subProp] = prop[subProp] || {})  
		});
		
		if (prop[subProp] !== undefined)
			return prop[subProp]
		else
			if (arguments.length == 3)
				return prop[subProp] = value(arguments[1].map(function(def) { require(def) }));
			else
				return prop[subProp] = value;
	};
	
	/**
	 *
	 * Provides an easy method to see if a property has been defined
	 *
	 * @param property  property to check if defined
	 * @return bool     if the property has been set
	 * 
	 */
	var defined = function(property) {
		return !!define(property);
	};

	/**
	 *
	 * Defines a list of requirements for a certain function or module to run
	 *
	 * @params modules  module/property list to return definitions for
	 */
	var require = exports.require = function(/* modules/prop */) {
		var modules = Array.prototype.slice.call(arguments, 0),
			exports = [];
		for (var mod=0; mod < modules.length; mod++) {
			if (!defined(modules[mod]))
				throw 'Module not loaded!';
			else
				exports.push(properties[modules[mod]]);
		}
		return (exports.length == 1) ? exports[0] : exports;
	};

		var updateComponents = exports.updateComponents = function(str, field, value) {
		str = (str || '?'+field+'=" "');
		str += (!(new RegExp('[?&]'+field+'=', 'i')).test(str))? ('&'+field + '=" "'): '';
		return (str = str.replace(new RegExp('([?&])'+field+'=".*?"', 'im'), '$1'+field+'="'+encodeURI(value)+'"'));
	};

	var getComponent = exports.getComponent = function(str, field) 
		{ return (!(new RegExp('[?&]'+field+'[&=]', 'i')).test(str||''))?null:(str.replace(new RegExp('.*[?&]'+field+'="(.*?)".*', 'i'), '$1')); };

	var clickHandle = function(ev) {
		var event = ev || window.event, targ = this.href;

		if (AJILE.isWithinAJILEDomain(targ) && this.target != '_blank') {
			if (event.shiftKey || event.ctrlKey)
				{ AJILE.tab.createTab(targ); }
			else
				{ AJILE.page.loadPage(targ, AJILE.tab.currentTab.contentEle); }

		(event.preventDefault)?event.preventDefault(): event.returnValue = false;
		(event.stopPropagation)?event.stopPropagation(): event.cancelBubble=true;
		
	}
	else 
		 { this.target = '_blank'; }
	};

	var siteRoot = define('siteRoot', document.location.toString().replace(/#.*/, '').replace(/[^\/]*?$/g, ''));
	var host = define('host', document.location.protocol + '//' + document.location.host+'/');
	var isInternal = define('isInternal', /(empsvcs)|(review)|(localhost)/.test(siteRoot));
	var isExternal = define('isExternal', !isInternal);
		
	var initArgs = define('initArgs', ('#'+document.location.hash +'||?'+ document.location.search).replace(/#!(.*?)\|\|/, '?!p="$1"||').replace(/=(?!")(\w*)/, '="$1"'));
	var firstPage = define('firstPage', getComponent(initArgs, '!p'));
//	var mainPage = define('mainPage', AJILE.page.relativeToAbs(AJILE.mainPage || 'index.htm', AJILE.siteRoot.split('/')));
	document.location.hash = '';

/* 	Object.keys(AJILE).forEach(function(module) { 
		if (AJILE[module] && AJILE[module].initialize && module != 'ui') AJILE.require(module);
	}); */

	var isWithinAJILEDomain = function(href) {
		 if (!~href.indexOf(require('host')))
			return false;
		 return true;
	 };


		
		
	return exports;
 })();


