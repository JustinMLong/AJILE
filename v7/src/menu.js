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