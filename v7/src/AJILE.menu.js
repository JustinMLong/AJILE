AJILE.define('menu', function(){

	var topMenu = { open: [], timeOut: 0, timeIn: 0};
	var subMenu = { open: [], timeOut: 0, timeIn: 0};
	var currLockedMenu =  null;

	AJILE.ui.Class.add(document.getElementById('navigation'), 'hasJS');
	AJILE.toArray(document.getElementsByTagName('a')).
		forEach(function(a){ a.onclick || (a.onclick = AJILE.clickHandle); });
	AJILE.menu.initMenuHide();


	var initMenuHide = function () {
		var expandItems = document.getElementById('navigation').getElementsByTagName('span');
		AJILE.bind(document.getElementById('tabs'), 'click', AJILE.menu.clearTop);
		AJILE.toArray(document.getElementById('navigation').children).filter(isElement).forEach(function(navEl, pos, arr) {
			AJILE.ui.Class.add(navEl, (pos*2 >= arr.length)?' right':'');
			AJILE.ui.Class.add(navEl, (pos > arr.length/3 && pos < Math.floor(arr.length*2/3))?' mid':'');

			navEl.onmouseover = navEl.onmouseout = AJILE.menu.toggleTop;
			if (AJILE.ui.Class.has(navEl.getElementsByTagName('ul')[0], 'flyout')) {
				for (var sIt=0, sItl=navEl.getElementsByTagName('b').length; sIt<sItl; sIt++) 
					 { AJILE.menu.initFlyouts(navEl.getElementsByTagName('b')[sIt]); } 
			}
		})

		for (var j=0; j < expandItems.length; j++) {
			if (/arrow/.test(expandItems[j].className)) 
				{ expandItems[j].parentNode.onclick = AJILE.menu.expandSub; }
		}
	};
	
	var initFlyouts = function (bEl) {
		var lIt = (!!bEl.parentNode.href)?bEl.parentNode.parentNode:bEl.parentNode;
		if ( AJILE.ui.Class.has(lIt, 'single') ) { 
			lIt.onmouseover = lIt.onmouseout = AJILE.menu.toggleSub; 
			lIt.onclick = AJILE.menu.toggleLock;
			if (lIt.getElementsByTagName('b')[0].getElementsByTagName('a').length > 0) {
				lIt.getElementsByTagName('b')[0].getElementsByTagName('a')[0].onclick = function(){return false;};
			}
		}
		else if (AJILE.ui.Class.has(lIt, 'sublist')) {
			AJILE.toArray(lIt.getElementsByTagName('ul')[0].childNodes).filter(isElement).forEach(function(subItems) {
				subItems.onmouseover = subItems.onmouseout = AJILE.menu.toggleSub;
				subItems.onclick = AJILE.menu.toggleLock;
				AJILE.toArray(subItems.childNodes).forEach(function(node) { 
					if (node.href && node.getElementsByTagName('ul').length > 0) (node.href = null,node.onclick = null);  
				})
			})
		}
	}
	
	var toggleTop = function (mEv) 
		{ AJILE.menu.toggleMenu.apply(this, [mEv, true]); };
	var toggleSub = function (mEv)
		{ if (!AJILE.menu.currLockedMen) { AJILE.menu.toggleMenu.apply(this, [mEv, false]); } };
		
	
	var toggleMenu = function (mEv, isTop) {
		var isOpening = (/over/.test((mEv||window.event).type)), menuObj = AJILE.menu[((isTop)?'top':'sub')+'Menu'];
		if (isOpening && !(menuObj.open[0] &&	menuObj.open[0].innerText == this.innerText)) 
			{ menuObj.open.push(this); }
		if ( menuObj.open.length > 1 )
			{ AJILE.menu.clearOpen(1,menuObj.open); }
		if (isOpening) {
			clearTimeout(menuObj.timeOut);
			menuObj.timeIn = window.setTimeout(AJILE.menu.changeMenu, 200,menuObj.open[menuObj.open.length-1],true);
		}
		else { 
			clearTimeout(menuObj.timeIn);
			menuObj.timeOut = window.setTimeout(AJILE.menu['clear'+((isTop)?'Top':'Open')], 1500,0,menuObj.open); 
		}
	};

	var toggleLock = function () {
		var prevLock = AJILE.menu.currLockedMen;
		AJILE.menu.clearOpen(0, AJILE.menu.subMenu.open);
		if (prevLock != null) AJILE.menu.unlockMenu();
		if (prevLock == null || prevLock != this.getElementsByTagName('ul')[0])
			AJILE.menu.lockMenu(this.getElementsByTagName('ul')[0]);
	};
	
	var lockMenu = function(menu) 
		{ menu.parentNode.className += ' lock'; AJILE.menu.currLockedMen = menu; };
	
	var unlockMenu = function() { 
		if (AJILE.menu.currLockedMen == null) return;
		var menu = AJILE.menu.currLockedMen;
		menu.parentNode.className = menu.parentNode.className.replace(/ lock/, ''); 
		AJILE.menu.currLockedMen = null; 
	};

	var changeMenu = function (ele, isExp) { 
		for (var i=0; i < ele.childNodes.length; i++)
			if (ele.childNodes[i].tagName && ele.childNodes[i].tagName.toLowerCase() == 'ul')
				ele.childNodes[i].className = ele.childNodes[i].className.replace(/ bl/, '') + ((isExp)?' bl':''); 
	};
 
	
	var expandSub = function (clEv) {
		var ele = (clEv||window.event).srcElement, isExpanding;
		while (ele.getElementsByTagName('span')[0] == null) ele = ele.parentNode;
		ele.getElementsByTagName('span')[0].innerHTML = ((isExpanding = ele.getElementsByTagName('span')[0].innerHTML =='+'))?'-':'+';
		AJILE.menu.changeMenu(ele, isExpanding);
		(clEv||window.event).cancelBubble = true;
	};
	
	var clearTop = function () {
		 AJILE.menu.unlockMenu();
		 AJILE.menu.clearOpen(0, AJILE.menu.topMenu.open); 
	 };
	
	var clearOpen = function (num,arr) {
		while(arr.length > num) 
			{ AJILE.menu.changeMenu(arr.shift(), false); }
	};

});

