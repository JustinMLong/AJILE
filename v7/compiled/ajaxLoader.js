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


var AJILE = {

	versionNum: '7.70', clientId: 0, clientCode: '',
	siteRoot: '', isInternal: false, isExternal: true, host: '',
	isAsync: true, mainPage: null, options: {}, 

	provide: function (property, value) {
		var prop = AJILE.options, subProp = property.split('.')[property.split('.').length-1];
		property.split('.').forEach(function(subProp, itr, arr) {
			if (itr != arr.length-1)
				prop = (prop[subProp] = prop[subProp] || {})  
		});
		
		return prop[subProp] !== undefined ? prop[subProp] : (prop[subProp] = value);
	},

	clickHandle: function(ev) {
		var event = ev || window.event, targ = this.href;
//		if ( (!e.which && e.button == 4) || e.which == 2)
//			{	AJILE.tab.createTab(targ); }

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

	updateLocation: function(page) {
		document.location.hash = AJILE.updateComponents(document.location.hash.toString(),'p',page.url);
		document.title = page.title;
	},

	require: function() {
		for (var a=0, exports, modules = arguments[a]; a < arguments.length; a++, modules = arguments[a]) if ((AJILE[modules] && AJILE[modules].initialize && !AJILE[modules].isInit) ) { 
			AJILE[modules].isInit = true; Object.keys((exports = AJILE[modules].initialize()) || {}).forEach(function(key) { 
				AJILE[modules][key] = exports[key]; }); 
		}
	},

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

	toArray: function(arrSet) { 
		if (!arrSet) return null;
		var tmp = [];
		if ('length' in arrSet) 
			{ for (var i =0; i < arrSet.length; tmp[i] = arrSet[i++]) ; }
		else 
			{ tmp[0] = arrSet; }
		return tmp; 
	},

	initialize: function(){
		AJILE.siteRoot = document.location.toString().replace(/#.*/, '').replace(/[^\/]*?$/g, '');
		AJILE.host = document.location.protocol + '//' + document.location.host+'/';
		AJILE.isInternal = AJILE.provide('isInternal', /(empsvcs)|(review)|(localhost)/.test(AJILE.siteRoot));
		AJILE.isExternal = AJILE.provide('isExternal', !AJILE.isInternal);
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
		if (!href) return;
		 //Check link type, if not same origin, return false
		 if (href.indexOf(':') > -1 && href.indexOf(document.location.protocol + '//' + document.location.host) == -1)
			return false;
		 if (!(/htm(l)?/i.test(href.replace(/#.*$/, '').match(/.*(\..*)$/)[1])))
			return false;
		if (href.indexOf('counselor_news') > -1)
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

AJILE.dev = {initialize: function() {
	var exports = {};
	var isDev = exports.isDev = AJILE.provide('dev.isDev', AJILE.getComponent(AJILE.initialize.initArgs, 'dev'));
	if (isDev) AJILE.ui.Class.add(document.body, 'dev');

	exports.updateInternalStatus = function(ev) 
		{ AJILE.isInternal = (ev||window.event).srcElement.checked; }
	exports.updateExternalStatus = function(ev) 
		{ AJILE.isExternal = (ev||window.event).srcElement.checked; }

	return exports;
} };

AJILE.dom = { initialize: function() {
	var exports = {}, 
		availableNodes = AJILE.provide('dom.availableNodes', 'a b li ul div style table tr td th h1 tbody code input span link');

	domNode = function(tag, subNodes, attr) {
		var attr = attr || {}, 
		subNodeSet = (subNodes == null || !Array.isArray(subNodes))
			? [subNodes] : subNodes,
		tmpTag = document.createElement(tag);
		Object.keys(attr).forEach(function(att) { tmpTag[att] = attr[att]; });
		subNodeSet.forEach(function(childEle) { 
		if(!childEle) return;
		tmpTag.appendChild((typeof childEle == 'string')
			? document.createTextNode(childEle) 
			: childEle
		);
		});
		return tmpTag;
	};

	$A = {};
	'ccint ccext'.split(' ').forEach(function(n) { document.createElement(n)});
	availableNodes.split(' ').forEach(function(elementType) { 
		exports[elementType] = $A[elementType] = function(subNodes, attr) { 
			return domNode(elementType, subNodes, attr); 
		};
	});

	return exports;

 } };

AJILE.event = (function() {
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

AJILE.history = {

	PageEntry: function(pageTitle, pageURL)
		{return {title: pageTitle, url: pageURL};},

	SessionHistory: {
		pagesHistory: [],
		addPage: function(page) {
			AJILE.event.publish((page.url == AJILE.mainPage)?'loadIndex':'loadPage', page);
			AJILE.history.SessionHistory.pagesHistory.push(page);
			document.getElementById('hist').src = AJILE.updateComponents(AJILE.siteRoot+'_private/blank.html?ts="'+(new Date()).getTime()+'"&p=" "', 'p', page.url);
		},
		getPage: function(url) {
		return AJILE.history.SessionHistory.pagesHistory.some(function(page) { return page.url == url; });
	}
	},

	initialize: function() {
	AJILE.bind(document.getElementById('hist'), 'load',function() {
	var doc = document.getElementById('hist').contentWindow.document;
		doc.title = window.top.document.title;
		var AJILE = window.top.AJILE, sLoc = AJILE.getComponent(decodeURI(doc.location.search.toString()), 'p'), 
			hashLoc = AJILE.getComponent(window.top.document.location.hash.toString(), 'p');
		if (!(sLoc == '' || hashLoc == '' || sLoc == hashLoc) && sLoc != AJILE.getComponent(window.top.document.getElementById('hist').src, 'p')) {
			if (AJILE.par.name.full && sLoc == AJILE.mainPage) AJILE.par.removeParSpecific();
			AJILE.page.loadPage(sLoc, window.top.AJILE.tab.currentTab.contentEle, 'FB'); 
		}
	});
	}
};

AJILE.menu = {

	menuTimeout: 0, submenuTimeout: 0, menuTimein: 0, submenuTimein: 0,
	openMenus: [], openSubMenus: [],
	navEles: null,

	initialize: function() {
		AJILE.menu.navEles = document.getElementById('navigation').getElementsByTagName('ul')[0].childNodes;
		var aTags = document.getElementsByTagName('a');
		for (var i=0, aLength=aTags.length; i<aLength; i++) {
			if (aTags[i].onclick != null || aTags[i].target.toString() != '')
				{continue;}
			if (!(AJILE.isWithinAJILEDomain(aTags[i].href)))
				{aTags[i].onmouseup = function() { return AJILE.clickHandle(); }; aTags[i].onclick = function() { return AJILE.preventDefault(); }; }
			else
				{aTags[i].target = "_blank";}
		}

		AJILE.menu.initMenuHide();
	},

	initMenuHide: function() {
		var expandItems = document.getElementById('navigation').getElementsByTagName('span');

		for (var navEl in AJILE.menu.navEles) {
			if (!!AJILE.menu.navEles[navEl].innerHTML) {
				if (navEl*2 >= AJILE.menu.navEles.length)
					{ AJILE.menu.navEles[navEl].className += ' right'; }
				AJILE.menu.navEles[navEl].onmouseover = AJILE.menu.navEles[navEl].onmouseout = AJILE.menu.toggleTop;
				if (/flyout/.test(AJILE.menu.navEles[navEl].innerHTML)) {
					for (var sIt=0, sItl=AJILE.menu.navEles[navEl].getElementsByTagName('b').length; sIt<sItl; sIt++) 
						 { AJILE.menu.initFlyouts(AJILE.menu.navEles[navEl].getElementsByTagName('b')[sIt]); }			 
				}
			}
		}

		for (var j=0; j < expandItems.length; j++) {
			if (/arrow/.test(expandItems[j].className)) 
				{ expandItems[j].parentNode.onclick = AJILE.menu.expandSub; }
		}
	},

	initFlyouts: function(bEl) {
		var lIt = (!!bEl.parentNode.href)?bEl.parentNode.parentNode:bEl.parentNode;
		if ( !!lIt.className && /single/.test(lIt.className) ) 
			{ lIt.onmouseover = lIt.onmouseout = AJILE.menu.toggleSub; }
		else {
			if (lIt.getElementsByTagName('ul')[0]) {
				for (var subIt=0, lIt=lIt.getElementsByTagName('ul')[0], subItL = lIt.childNodes.length; subIt<subItL; subIt++) 
					{ lIt.childNodes[subIt].onmouseover = lIt.childNodes[subIt].onmouseout = AJILE.menu.toggleSub; }
			}
		}
	},	

	toggleTop: function(mEv) 
		{ AJILE.menu.toggleMenu.apply(this, [mEv, true]); },
	toggleSub: function(mEv)
		{ AJILE.menu.toggleMenu.apply(this, [mEv, false]); },


	toggleMenu: function(mEv, isTop) {
		var isOpening = (/over/.test((mEv||window.event).type)), menArr = AJILE.menu[(isTop)?'openMenus':'openSubMenus'];
		if (isOpening && !(menArr[0] &&	menArr[0].innerText == this.innerText)) 
			{ menArr.push(this); }
		if ( menArr.length > 1 )
			{ AJILE.menu.clearOpen(1,menArr); }
		if (isOpening) {
			clearTimeout(AJILE.menu[((isTop)?'sub':'')+'menuTimeout']);
			AJILE.menu[((isTop)?'sub':'')+'menuTimein'] = window.setTimeout(AJILE.menu.changeMenu, 200,menArr[menArr.length-1],true);
		}
		else { 
			clearTimeout(AJILE.menu[((isTop)?'sub':'')+'menuTimein']);
			AJILE.menu[((isTop)?'sub':'')+'menuTimeout'] = window.setTimeout(AJILE.menu.clearOpen, 500,0,menArr); 
		}
	},


	changeMenu: function(ele, isExp) {
		for (var eleCh in ele.childNodes) {
			if (ele.childNodes[eleCh].innerHTML) 
				{ ele.childNodes[eleCh].className = ele.childNodes[eleCh].className.replace(' bl', '')[(!isExp)?'toString':'concat'](' bl'); }
		}
	},

	
	expandSub: function(clEv) {
		var ele = (clEv||window.event).srcElement;
		if (ele.getElementsByTagName('span')[0] == null) ele = ele.parentNode;
		ele.getElementsByTagName('span')[0].innerHTML = (ele.getElementsByTagName('span')[0].innerHTML =='+')?'-':'+';

		ele.getElementsByTagName('ul')[0].className = (!/bl/.test(ele.getElementsByTagName('ul')[0].className))?'bl':'';

		(clEv||window.event).cancelBubble = true;
		return false;
	},

	clearOpen: function(num,arr) {
		while(arr.length > num) 
			{ AJILE.menu.changeMenu(arr.shift(), false); }
	}

};

AJILE.page = {

	loadPage: function(newLocation, ele, override) {
		var hash, xhttp;
		newLocation = newLocation.split('#');
		hash = newLocation[1]||'#'; newLocation = newLocation[0];

		if ( ((AJILE.getComponent(document.location.hash, 'p') == newLocation) && !override) || newLocation == AJILE.siteRoot+'#')
			{ return AJILE.page.goToBookMark(hash); }
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() { if (xhttp.readyState == 4) AJILE.page.getPage(xhttp, newLocation, hash);	};
		xhttp.open('GET',newLocation+'?'+(new Date()).getTime(),AJILE.isAsync);
		xhttp.send('');
	},

	getPage : function(xhttp, newLocation, hash) {
		var rState = AJILE.page.updatePage.apply(xhttp, [newLocation]);
		if (AJILE.tab.currentTab.getPer()%AJILE.tab.permissions.mutate != 0) AJILE.tab.moveToTab(AJILE.tab.allTabs.check(0).id);
		AJILE.tab.currentTab.setContent(rState.text);
		AJILE.page.goToBookMark(hash);
		AJILE.tab.currentTab.setTitle(rState.page.title.replace(/.*?\:/, '')|| 'Untitled Page');
		AJILE.ui.updateBreadcrumbs(rState.page.url);
		if (rState.page.scripts.length != 0 && rState.page.scripts.join('') != '') rState.page.scripts.forEach(function(script) { 
			(window.execScript) ? window.execScript(script) : window.eval.call(window, script);
		})
		AJILE.styles.removeByTag('page');
		rState.page.styles.forEach(function(style) { AJILE.styles.add(style.selector, style.style, 'page'); })

		AJILE.updateLocation(rState.page);
		AJILE.history.SessionHistory.addPage(rState.page);
	},

	updatePage: function(newLocation) {
		var pageInfo = { 'text': null, 'page': new AJILE.history.PageEntry(null, newLocation) }, newBody;

		if ( this.status == 200 ) {
			pageInfo.page.title = this.responseText.getInnerHtml('title').getInnerHtml('h1');
			newBody = this.responseText.getInnerHtml('body').getInnerHtml('div', 'id="content"');
			newBody = AJILE.page.updateAttr(newBody,'href', (newLocation).split('/') );
			newBody = AJILE.page.updateAttr(newBody,'src', (newLocation).split('/') );
			newBody = AJILE.par.replaceParValues(newBody);
			pageInfo.page.scripts = (this.responseText.match(/<script.*?>((?:.|\n|\r))*?<\/script>/gim)||[]).join('/**AJILE**/').replace(/<\/?script.*?>/gi, '').replace(/<!--/g, '').replace(/-->/g, '').split('/**AJILE**/');
			pageInfo.page.styles = (this.responseText.match(/<style.*?>((?:.|\n|\r))*?<\/style>/gim)||[]).join('\n').replace(/<\/?style.*?>/gi, '').
				replace(/[ \t\r\n]+/g, ' ').split('}').slice(0,-1).map(function(prop) { return { selector: prop.replace(/\{.*/g, ''), style: prop.replace(/.*\{/g, '') }; })
		}
		else {
			newBody = '<h1>Error ('+this.status+' ['+this.statusText+']):<br />If you think this is in error, send a bug</h1><hr />';
			pageInfo.page.title ='ERR: Page Not Found';
			pageInfo.page.scripts = [];
			pageInfo.page.styles  = [];
		}
		pageInfo.text = newBody;
		return pageInfo;
	},


	updateAttr: function(newBody,tag,currFileLoc) {
		var regEx = new RegExp(tag+'="(?!(javascript|mailto\:))(.*?)"', 'gi');

		newBody = newBody.replace(regEx, function(fStr,m1, loc) {
			 return tag+'="'+AJILE.page.relativeToAbs(loc,currFileLoc)+'" onclick="AJILE.clickHandle.apply(this, [arguments[0]]);"';
		});

		return newBody;
	},

	relativeToAbs: function(hrefCh, currFileLocat) {
		var newHref = (hrefCh.indexOf('#')==0)?currFileLocat.join('/')+hrefCh:'', upDirC = hrefCh.matchCount(/\.\./g);
		if (!newHref) {
			if (hrefCh.indexOf(':') > -1) 
				newHref = hrefCh;
			else {
				newHref = (currFileLocat.length<=1)?'':(currFileLocat.slice(0,-1).join('/')+'/');
				if (upDirC) { newHref =	(newHref.split('/').splice(0, (((newHref.match(/\//g)||[]).length)-upDirC)).join('/')+ '/'); }
				newHref += hrefCh.replace(/(\.\.\/)/g, '');
			}
		}

		return newHref;
	},

	goToBookMark: function(bookmark) {
		var ele = document.getElementById(bookmark) || document.getElementsByName(bookmark)[0];
		if (!ele) window.scrollTo(0,0);
		else window.scrollTo(0,(AJILE.page.getY(ele)-100));
	},

	getY: function(elem)
		{ return (elem.offsetParent ? (elem.offsetTop + AJILE.page.getY(elem.offsetParent)) : elem.offsetTop); },

	initialize: function() {
		for (var as=0, aLinks = document.getElementById('content').getElementsByTagName('a'); as < aLinks.length; as++) {
		 if (aLinks[as].onclick != null || aLinks[as].target.toString() != '')
				{continue;}
			if (!(aLinks[as].href.indexOf(AJILE.siteRoot) == -1 || /javaLinkscript/i.test(aLinks[as].href)))
				{aLinks[as].onmouseup = function() { return AJILE.clickHandle(); };
				 aLinks[as].onclick = function() { return AJILE.preventDefault(); }; }
			else
				{aLinks[as].target = "_blank";}
		}
 }

};

AJILE.par = {

	name: {full: null, sub: null, top: null, common: null}, pargroups: [],
	queryString: null, menuName: null, indexName: null, subSplitter: '-',

	loadParMenu: function() {
		var xhttp_menu = new XMLHttpRequest();

		xhttp_menu.open('GET',AJILE.par.replaceParValues(AJILE.par.menuName),AJILE.isAsync);
		xhttp_menu.onreadystatechange = function() {
			if ( xhttp_menu.readyState == 4 && (xhttp_menu.status == 200 || xhttp_menu.status == 304) ) {
			document.getElementById('footer').appendChild($A.div(null, { id: 'oldMenuHolder' }));
				document.getElementById('oldMenuHolder').innerHTML = document.getElementById('navigation').innerHTML;
				document.getElementById('navigation').innerHTML = '';

		var response = AJILE.page.updatePage.call(xhttp_menu, AJILE.par.menuName);
				document.getElementById('topNav').innerHTML = response.text;
				AJILE.menu.initialize();
			}
		};

		xhttp_menu.send('');
	},

	updateBanner: function() {
		var par_list = $A.li($A.a('Group Home', {href: AJILE.par.replaceParValues(AJILE.par.indexName), onclick: AJILE.clickHandle}));

		var firstList = document.getElementById('header').getElementsByTagName('ul')[0],
			newsLi = document.getElementById('header').getElementsByTagName('li')[1],
			firstA = document.getElementsByTagName('a')[0], secondA = document.getElementsByTagName('a')[1];

		firstA.onclick = secondA.onclick = function() { AJILE.par.removeParSpecific(); AJILE.clickHandle.apply(this); return false;};
		firstA.target = secondA.target = '_parent';
		firstA.href = secondA.href = AJILE.mainPage;
		firstList.insertBefore(par_list,newsLi);
	},

	removeParSpecific: function() {
	if (!AJILE.par.name.full) return;
		var anc = document.getElementsByTagName('a');
		anc[0].href = anc[1].href = AJILE.mainPage;
		AJILE.bind([anc[0], anc[1]], 'click', AJILE.clickHandle);

		anc[2].parentElement.parentElement.removeChild(anc[2].parentElement);
	if (document.getElementById('oldMenuHolder'))
		document.getElementById('navigation').innerHTML = document.getElementById('oldMenuHolder').innerHTML;
		document.location.hash = '';
		AJILE.styles.removeByTag('par');

		AJILE.ui.Class.remove(document.body, AJILE.par.name.full);
		AJILE.menu.initialize();
		Object.keys(AJILE.par.name).forEach(function(component) { AJILE.par.name[component] = null; });
		AJILE.initialize.firstPage = null;
	},

	loadParInfo: function(parName) {
		if (!parName.full) return;
		AJILE.require('styles');
		var hardLink = (AJILE.dev.isDev && document.location.hash)? document.location.hash.toString(): '',
			pargroups = AJILE.par.pargroups || document.getElementById('gourl').options;
		pargroups.forEach(function(par) {
		if (par.subGroups) {
		AJILE.styles.add('.'+par.subGroups[0].value.split('-')[0], 'display: none !important;', 'par'); 
		AJILE.styles.add('.not-'+par.subGroups[0].value.split('-')[0], 'display: inline-block !important;', 'par');
		par.subGroups.forEach(function(subGroup) {
			AJILE.styles.add('.'+subGroup.value, 'display: none !important;', 'par'); 
			AJILE.styles.add('.not-'+subGroup.value, 'display: inline-block !important;', 'par');
		});
		}
		else {
			AJILE.styles.add('.'+par.value, 'display: none !important;', 'par'); 
			AJILE.styles.add('.not-'+par.value, 'display: inline-block !important;', 'par');
		}
		});

	Object.keys(parName).filter(function(unit) { return !!parName[unit] && unit != 'common'; }).forEach(function(unit) {
		AJILE.styles.add('body .'+parName[unit], 'display: inline-block !important;', 'par');
		AJILE.styles.add('body .not-'+parName[unit], 'display: none !important;', 'par');
		AJILE.styles.add('.'+parName[unit], 'display: inline-block !important;', 'par');
		AJILE.styles.add('.not-'+parName[unit], 'display: none !important;', 'par');
		AJILE.ui.Class.add(document.body, parName[unit]);
	});

		AJILE.par.loadParMenu();
		AJILE.par.updateBanner();
		AJILE.initialize.firstPage = AJILE.par.replaceParValues(AJILE.initialize.firstPage||AJILE.par.indexName);
	},

	forceToGroup: function(parName) {
		AJILE.mainPage = AJILE.par.replaceParValues(AJILE.par.indexName);
	var ancs = document.getElementsByTagName('a');
		AJILE.isAsync = false;
		AJILE.par.handlePar(parName);

		AJILE.event.subscribe('loadIndex', function() { AJILE.par.forceToGroup(parName); });
		for (var i = 0; i < 3; i++) ancs[i].href = AJILE.mainPage;
		ancs[2].parentElement.parentElement.removeChild(ancs[2].parentElement);
	},

	replaceParValues: function(str) {
		str = str.replace(/\[pargroup\]/g, AJILE.par.name.full);
		str = str.replace(/\[topgroup\]/g, AJILE.par.name.top);
		str = str.replace(/\[subgroup\]/g, AJILE.par.name.sub);
		str = str.replace(/\[parname\]/g, AJILE.par.name.common);
		return str;
	},

	initialize: function() {
		AJILE.par.queryString = AJILE.provide('par.queryString', 'pargroup=[pargroup]');
		AJILE.par.menuName = AJILE.provide('par.menuName', AJILE.siteRoot+'_private/menus/par_menu/menu_[pargroup].htm');
		AJILE.par.indexName = AJILE.provide('par.indexName', AJILE.siteRoot+'_private/pargroups/index_[pargroup].htm');
		AJILE.event.subscribe('loadIndex', AJILE.ui.createParBox);
		AJILE.event.subscribe('loadIndex', AJILE.par.removeParSpecific);

		if (AJILE.getComponent(AJILE.initialize.initArgs, AJILE.par.queryString))
			AJILE.par.handlePar(AJILE.getComponent(AJILE.initialize.initArgs, AJILE.par.queryString));
		else if (AJILE.par.name.full)
			AJILE.par.loadParInfo(AJILE.par.name.full);
	},

	handlePar: function(parName) { 
		AJILE.require('tab')
		if (~parName.indexOf(AJILE.par.subSplitter)) {
			AJILE.par.name.top = parName.split(AJILE.par.subSplitter)[0];
			AJILE.par.name.sub = parName.split(AJILE.par.subSplitter)[1]
		}
		AJILE.par.name.full = parName;
		//try to get the user friendly name, if that fails add generic "Current group"
		AJILE.par.name.common = (AJILE.par.pargroups)? 
			(AJILE.par.pargroups.filter(function(group) { return ~('par-'+parName).indexOf(group.tag.trim()); })[0]||{text: 'Current Group'}).text.replace(/\[.*?\]/gim, '').trim() :
			'Current Group';

		document.location.hash = AJILE.par.replaceParValues(AJILE.par.queryString)+'&p=" "';
		AJILE.par.loadParInfo(AJILE.par.name);
		AJILE.tab.initKBT();
	}

};

AJILE.styles = { initialize: function(){
	var exports = {};
	AJILE.require('dom');

	var styleSheet = (document.getElementsByTagName('head')[0].appendChild($A.style(null, {type: 'text/css'})),document.styleSheets[document.styleSheets.length-1]), 
		styles = {}, ssConnector = new OrganizedList(function(obj, id) {styles[obj.selector].index = id; obj.index = id; });

	styleSheet.cssRules || (styleSheet.cssRules = styleSheet.rules);
	styleSheet.deleteRule || (styleSheet.deleteRule = styleSheet.removeRule);
	styleSheet.appendRule = (!!styleSheet.addRule)?
	(function(sel, nStyle) { styleSheet.addRule(sel, nStyle); }):
		(function(sel, nStyle) { styleSheet.insertRule(sel+' {'+nStyle+'}', styleSheet.cssRules.length);});

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


AJILE.tab = {

	currentTab: null, 
	allTabs: new OrganizedList(function updateTabPlace(obj, newId){obj.setId(newId);}),
	permissions: {
		'mutate': 3,
		'close': 5
	},

	initRegis: function() {
	if (AJILE.clientId && document.getElementById('cliID') && document.getElementById('regisForm')) {
		document.getElementById('cliID').value = AJILE.clientId;
		document.getElementById('regisForm').submit();
	}
	},

	Tab: function(contEle, per, ele, tabNameEle) {
		var tabPer = AJILE.tab.permissions, idPermiss = 1, nameEle;
		if (!per || per.length == 0) { idPermiss = 2; }
		else { for (var perN=0,perL=per.length; perN < perL; perN++) idPermiss *= tabPer[per[perN]]; }
		nameEle = document.getElementById(ele.id+'Name');
		nameEle.id = idPermiss+'~N~'+(AJILE.tab.allTabs.valueOf().length);
		ele.id = idPermiss+'~T~'+(AJILE.tab.allTabs.valueOf().length);
		return {
			id: ele.id,
			contentEle: contEle,
			getPer: function() { return this.id.split('~')[0]; },
			setTitle: function(newTitle) { 
				if (this.getPer()%AJILE.tab.permissions.mutate == 0) { document.getElementById(this.id.replace('T','N')).innerHTML=newTitle; }
			},
			setContent: function(newContent) { 
				if (this.getPer()%AJILE.tab.permissions.mutate == 0) { this.contentEle.innerHTML = newContent; }
			},
			closeTab: function() { 
				if (this.getPer()%AJILE.tab.permissions.close == 0) 
					{ document.getElementById('tabs').removeChild(document.getElementById(this.id)); } 
			},
			setId: function(newId) { 
				document.getElementById(this.id.replace('T','N')).id = this.id.replace('T','N').split('~')[0] + '~N~' + newId; 
				document.getElementById(this.id).id = this.id.split('~')[0] + '~T~' + newId; 
			}
		};
	},

	initKBT: function(pageLoc) {
		AJILE.page.loadPage(
		AJILE.page.relativeToAbs(pageLoc||AJILE.initialize.firstPage||AJILE.mainPage, AJILE.siteRoot.split('/')),
		AJILE.tab.allTabs.check(0).contentEle, 'init');
	},
 
	initialize: function() {
		var allTabs = document.getElementById('tabs').childNodes, permiss, tabNameNode;
		AJILE.toArray(document.getElementById('tabs').children).filter(isElement).slice(1).forEach(function(node) {
			if (~node.nodeName.toUpperCase().indexOf('CCINT')) {
				if (node.getElementsByTagName('div').length == 0) return;
				node = node.getElementsByTagName('div')[0];
			}

			permiss = (AJILE.ui.Class.has(node, 'mutable'))?['mutate']:[];
			tabNameNode = document.getElementById(node.id+'Name');
			AJILE.tab.allTabs.push(new AJILE.tab.Tab(node.getElementsByTagName('div')[1],permiss,node));

			if (AJILE.ui.Class.has(node, 'activeTab'))
				{ AJILE.tab.currentTab = AJILE.tab.allTabs.peek(); }
			tabNameNode.onclick = AJILE.tab.selectTab;
			tabNameNode.style.left = (AJILE.tab.allTabs.valueOf().length-1)*-3+'px';
			tabNameNode.style.zIndex = 10-(AJILE.tab.allTabs.valueOf().length);
		})

	AJILE.tab.defaultTab = AJILE.tab.allTabs.check(AJILE.tab.defaultTab || 0);
	AJILE.tab.currentTab = AJILE.tab.currentTab || AJILE.tab.defaultTab;
	AJILE.tab.moveToTab(AJILE.tab.currentTab.id);
	AJILE.tab.initRegis();
	},

	moveToTab: function(tabId) {
		var curr = AJILE.tab.currentTab, cTab = curr.id.replace('T','N');
		document.getElementById(cTab).className = document.getElementById(cTab).className.replace(/ ?activeTab/g, '');
		document.getElementById(curr.id).className = document.getElementById(curr.id).className.replace(/ ?activeTab/g, '');
		AJILE.tab.currentTab = AJILE.tab.allTabs.check(tabId.split('~')[2]);
		document.getElementById(tabId.replace('N','T')).className += ' activeTab';
		document.getElementById(tabId.replace('T','N')).className += ' activeTab';
	},

	selectTab: function(ev) {
		var eTab = (ev || window.event).srcElement.id;
		if (eTab == AJILE.tab.currentTab.id)
			{ return; }
		else 
			{ AJILE.tab.moveToTab(eTab); }
	},

	
	createTab: function(locToAdd) {
		var nTab = $A.div($A.div(null, {className: 'tabContents'}), {id: 'temp1', className: 'tab'}), 
		nName = $A.div('Loading Tab', {id: 'temp1Name', className: 'tabName', onclick: AJILE.tab.selectTab});
		document.getElementById('tabNames').appendChild(nName);
		document.getElementById('tabs').appendChild(nTab);

		AJILE.tab.allTabs.push(new AJILE.tab.Tab(nTab.childNodes[0], ['mutate', 'close'], nTab, nName));
		AJILE.page.loadPage(locToAdd, AJILE.tab.allTabs.peek().contentEle, 'TabAdd');
		AJILE.tab.moveToTab(AJILE.tab.allTabs.peek().id);
		nName.style.left = (AJILE.tab.allTabs.valueOf().length-1)*-3+'px';
	}

};

AJILE.ui = (function() {	
	var exports = {};

	var Class = exports.Class = function(node, setValue) {
		if (arguments.length > 1) 
			{ node.className = setValue; }
		else 
			{ return node.className; }
	}

	Class.add = function(node, newClass) {
		if ((' '+node.className).indexOf(' '+newClass) == -1) 
			{ return !!(node.className += ' ' + newClass); }
		return false;	
	}

	Class.remove = function(node, classToRemove) {
		if ((new RegExp(classToRemove)).test(node.className))
			{ return (node.className = node.className.replace(classToRemove, '')); }
		return false;
	}

	Class.toggle = function(node, toggleClass) {
		if (~(' '+node.className).indexOf(' '+toggleClass))
			{ return !!(Class.remove(node, toggleClass)); }
		else
		 { return !!(Class.add(node, toggleClass)); }
	}

	Class.has = function(node, checkClass) {
		return (node && ~(' '+node.className).indexOf(' '+checkClass));
	}

	var setContent = exports.setContent = function(node, content, needsSanitize) {
		if (!needsSanitize) { 
			content = content.replace(/</g, '&lt;').
				replace(/>/, '&gt;').
				replace(/\"/, '&quot;'); 
		}
		node.innerHTML = content;
	}

	var updateBreadcrumbs = exports.updateBreadcrumbs = function(loc, isHash) {
		if (!document.getElementById('breadcrumbs')) return;
		 var crumb = document.getElementById('breadcrumbs').innerHTML.toString();
		 crumb = (arguments.length > 1) ?
			 crumb.replace(/#.*/, ' # '+loc||'Top') :
		 loc.replace(AJILE.host, '').replace(/(\/)/g, ' &gt; ');
	 setContent(document.getElementById('breadcrumbs'), crumb, false);
	}

	var createParBox = exports.createParBox = function() {
		var list, parInfo = [], form;
		if (! ((list = document.getElementById('gourl')) && (form = list.parentNode)) ) return;
		 while (form.tagName.toUpperCase() != 'FORM' && (form = form.parentNode)) ;
		form.onsubmit = function() { return false; };

		 for (var i=0; i < list.children.length; i++) {
		if (list.children[i].value && list.children[i].value == '#') continue;
		if (list.children[i].nodeName.toUpperCase() == 'OPTGROUP' && list.children[i].label) {
		parInfo.push({ text: list.children[i].label, subGroups: [], disabled: list.children[i].disabled });
			for (var j=0; j < list.children[i].children.length; j++)
				parInfo[parInfo.length-1].subGroups.push({ 
			text: list.children[i].children[j].text, 
			tag: 'loc-'+i+'-'+j+' par-'+list.children[i].children[j].value, 
			value: list.children[i].children[j].value,
			disabled: list.children[i].disabled || list.children[i].children[j].disabled || 
				~(' '+list.children[i].className+' ').indexOf(' future ') || ~(' '+list.children[i].children[j].className+' ').indexOf(' future ')
			});
		}
		else
		parInfo.push({ text: list.children[i].innerText, 
			tag: ' par-'+list.children[i].value+' '+list.children[i].className, 
			value: list.children[i].value,
			disabled: list.children[i].disabled || ~(' '+list.children[i].className+' ').indexOf(' future ')
		});
		}
		 AJILE.par.pargroups = parInfo;
		 list.parentNode.insertBefore(createComboBox('Begin typing name of pargroup or click the arrow to choose from a list', parInfo, 
			function(){ var el = (arguments[0]||window.event).srcElement; if (Class.has(el, 'par-')) AJILE.par.handlePar(/par-([^ ]*)/.exec(el.className)[1]); }), list);
		list.parentNode.removeChild(list.nextSibling.nextSibling);
		list.parentNode.removeChild(list);
		AJILE.event.publish('parBoxCreated');
	}

	var createComboBox = exports.createComboBox = function(initMessage, listInfo, action) {
		var input = $A.input(null, {
		onkeydown: function(ev) { ev = ev||window.event; comboTyping(ev, this, this.nextSibling.nextSibling.nextSibling); },
		onkeyup: function(ev) { ev = ev||window.event; comboTyping(ev, this, this.nextSibling.nextSibling.nextSibling); },
		onfocus: function(ev) { ev = ev||window.event; 
		Class.add(this.nextSibling.nextSibling.nextSibling, 'focused-0'); Class.add(this, 'written'); 
		comboTyping({}, this, this.nextSibling.nextSibling.nextSibling); 
		},
		onclick: function(ev) { ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; },
		className: 'comboBox' }),
			text = $A.span(initMessage, {onclick: function(ev) { ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; this.previousSibling.focus(); } }),
			dropDown = $A.span(null, {innerHTML: '&#9660;', className: 'downArrow', 
		onclick: function(ev) {
			ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; 
			this.previousSibling.onclick(); 
			showSelections(this.previousSibling.previousSibling, '', this.nextSibling); 
		} 
		}),
			list = $A.ul(null, {className: 'comboList', onclick: function(ev) { 
		 ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; 
		 action.apply(this, [].slice.apply(arguments, [0])); return false; 
		} }),
		loc = 1;

		listInfo.forEach(function(group) {
		var subUnit = [[group.text]];
		if (group.subGroups)
			subUnit[0].push( $A.ul(group.subGroups.filter(function(subGroup) { return !subGroup.disabled; }).map(function(subGroup) { return $A.li(subGroup.text, {className: subGroup.tag}); })) );
		
		if (!group.disabled) {
			subUnit.push (group.subGroups?{className: 'toplevel'}:{className:('loc-'+loc++) + ' ' + group.tag});
			list.appendChild($A.li.apply(null, subUnit));
		}
		});

	AJILE.bind(document, 'click', function(ev) { 
		Class.remove(input, 'written'); 
	});

		return $A.div([input, text, dropDown, list], {className: 'comboGroup', onblur: function() {
			var input = this.childNodes[0], list = this.childNodes[3];
			input.value = ''; Class.remove(input, 'written');
			showSelections(input, '', list); Class.remove(list, /focused-\d+/i);
		}
	});

	}

	var comboTyping = function(ev, input, list) {
		var shown = (input.showing||'').split(','), focus = +(/focused-(\d+)/.exec(list.className)[1]), 
		thisNode = (~focus)?(~shown[focus].indexOf('-')?list.children[shown[focus].split('-')[0]-1].getElementsByTagName('li')[shown[focus].split('-')[1]]:list.children[shown[focus]-1]):null,
		nextNode;
		switch (ev.keyCode) {
			case (38): { 
				if (focus != 0 && /down/i.test(ev.type)) {
					nextNode = ~shown[focus-1].indexOf('-')?list.children[shown[focus-1].split('-')[0]-1].getElementsByTagName('li')[shown[focus-1].split('-')[1]]:list.children[shown[focus]-2];
					list.scrollTop -= thisNode.offsetHeight;

			Class.remove(thisNode, 'focused'); 
					Class.add(nextNode, 'focused');
					list.className = list.className.replace(/focused-(\d+)/, 'focused-'+(focus-1));
					return false;
				}
				break;
			}; //up
			case (40): {
				if (focus != shown.length-1 && /down/i.test(ev.type)) {
			nextNode = ~shown[focus+1].indexOf('-')?list.children[shown[focus+1].split('-')[0]-1].getElementsByTagName('li')[shown[focus+1].split('-')[1]]:list.children[shown[focus]];
			list.scrollTop += thisNode.offsetHeight;

					Class.remove(thisNode, 'focused'); 
					Class.add(nextNode, 'focused'); 
					list.className = list.className.replace(/focused-(\d+)/, 'focused-'+(focus+1));
					return false;
				}
				break;
			}; //down
			case (13): { if (/down/i.test(ev.type)) {
				list.onclick({srcElement: thisNode});
				return false;
		} };
			default: {showSelections(input, input.value, list);} //anything else
		}
	};

	var showSelections =	function(input, typedEntry, list) {
		var visi={showing:[],hiding:[]}, subItems = AJILE.toArray(list.children), firstShown;
	for (var loc = 0; liNode = subItems[loc]; loc++) {
		if (liNode.getElementsByTagName('ul').length > 0) 
		{ subItems.splice.apply(subItems, [loc, 1].concat(AJILE.toArray(liNode.getElementsByTagName('li')))); liNode = subItems[loc]; }

		Class.remove(liNode, 'focused');
		if (!matches(liNode, RegExp.escapeText(typedEntry)))
			{ Class.add(liNode, 'invisi'); visi.hiding.push(liNode.className.match(/loc-(.*?) /)[1]); }
		else 
			{ Class.remove(liNode, 'invisi'); (liNode.className.match(/loc-(.*?) /))?visi.showing.push(liNode.className.match(/loc-(.*?) /)[1]):0; }
		}
	firstShown = (~visi.showing[0].indexOf('-')?visi.showing[0].split('-').reduce(function(a, b) { return +a+(+b); }):visi.showing[0])-1;
		Class.add(subItems[firstShown], 'focused');
		list.className = list.className.replace(/focused-(\d+)/, 'focused-'+0);
		input.hiding = visi.hiding.join(',');
	input.showing = visi.showing.join(',');
	}

	var matches = function(node, inputReg) {
	inputReg = new RegExp('[ -\([]'+inputReg, 'gi');
	if (inputReg.test(' '+node.innerText)) return true; 
	if (inputReg.test(' '+node.className.replace(/par-/, '').replace('focused', '').replace(/loc-.*? /, ''))) return true;
	return false;
	}

	return exports;
	})();