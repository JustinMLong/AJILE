AJILE.define('page', function() {

	
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
		AJILE.ui.setContent(document.getElementById('breadcrumbs'), rState.page.url.replace(AJILE.require('siteRoot'));
		if (rState.page.scripts.length != 0 && rState.page.scripts.join('') != '') rState.page.scripts.forEach(function(script) { 
			(window.execScript) ? window.execScript(script) : window.eval.call(window, script);
		})
		AJILE.styles.removeByTag('page');
		rState.page.styles.forEach(function(style) { AJILE.styles.add(style.selector, style.style, 'page'); })

		AJILE.updateLocation(rState.page);
		AJILE.history.SessionHistory.addPage(rState.page);
	},
	
	updateLocation: function(page) {
		document.location.hash = AJILE.updateComponents(document.location.hash.toString(),'p',page.url);
		document.title = page.title;
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
});