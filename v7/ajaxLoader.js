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
	var define = exports.define = function (property, value) {
		var prop = properties, subProp = property.split('.')[property.split('.').length-1];
		property.split('.').forEach(function(subProp, itr, arr) {
			if (itr != arr.length-1)
				prop = (prop[subProp] = prop[subProp] || {})  
		});
		
		return prop[subProp] !== undefined ? prop[subProp] : (prop[subProp] = value);
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
		return !!define(propery);
	};

	/**
	 *
	 * Defines a list of requirements for a certain function or module to run
	 *
	 * @params modules  module/property list to return definitions for
	 */
	require: function(/* modules/prop */) {
		var modules = Array.prototype.slice.call(arguments, 0),
			exports = [];
		for (var mod=0; mod < modules.length; mod++) {
			if (!defined(modules[mod]))
				throw new Exception('Module not loaded!');
			else
				exports.push(properties[modules[mod]]);
		}
		return exports;
	},
	
	isInternal: false, isExternal: true, host: '',
	isAsync: true, mainPage: null, options: {}, 


	clickHandle: function(ev) {
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
	},

	initialize: function(){
		define('siteRoot', document.location.toString().replace(/#.*/, '').replace(/[^\/]*?$/g, ''));
		define('host', document.location.protocol + '//' + document.location.host+'/');
		define('isInternal', /(empsvcs)|(review)|(localhost)/.test(AJILE.siteRoot));
		define('isExternal', !AJILE.isInternal);
		[{tag: 'ccint', style: 'display: '+(AJILE.isInternal?'block':'none')}, 
		 {tag: 'ccext', style: 'display: '+(AJILE.isExternal?'block':'none')},
		 {tag: '#navigation li > ccint', style: 'display: '+(AJILE.isInternal?'inline-block':'none')}, 
		 {tag: '#navigation li > ccext', style: 'display: '+(AJILE.isExternal?'inline-block':'none')},].
		forEach(function(st) { AJILE.require('styles'); AJILE.styles.add(st.tag, st.style, 'Int/Ext') })
			
		AJILE.initialize.initArgs = ('#'+document.location.hash +'||?'+ document.location.search).replace(/#!(.*?)\|\|/, '?!p="$1"||').replace(/=(?!")(\w*)/, '="$1"');
		AJILE.initialize.firstPage = AJILE.getComponent(AJILE.initialize.initArgs, '!p')||AJILE.initialize.firstPage;
		AJILE.mainPage = AJILE.page.relativeToAbs(AJILE.mainPage || 'index.htm', AJILE.siteRoot.split('/'));
		document.location.hash = '';

		Object.keys(AJILE).forEach(function(module) { 
			if (AJILE[module] && AJILE[module].initialize && module != 'ui') AJILE.require(module);
		});

		AJILE.tab.initKBT();
	},

	isWithinAJILEDomain: function(href) {
		 if (!~href.indexOf(require('host'))
			return false;
		 return true;
	 },

	updateComponents: function(str, field, value) {
		str = (str || '?'+field+'=" "');
		str += (!(new RegExp('[?&]'+field+'=', 'i')).test(str))? ('&'+field + '=" "'): '';
		return (str = str.replace(new RegExp('([?&])'+field+'=".*?"', 'im'), '$1'+field+'="'+encodeURI(value)+'"'));
	},

	getComponent: function(str, field) 
		{ return (!(new RegExp('[?&]'+field+'[&=]', 'i')).test(str||''))?null:(str.replace(new RegExp('.*[?&]'+field+'="(.*?)".*', 'i'), '$1')); }
 };


