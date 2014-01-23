AJILE.define('history', function(event) {

	var historyContainer = AJILE.define('historyContainer', document.getElementById('hist'));
	var historyPage = AJILE.define(AJILE.require('siteRoot')+'_private/blank.html');
	
	var PageEntry = function(pageTitle, pageURL) {
		return {
			title: pageTitle, 
			url: pageURL
		};
	};

	var SessionHistory = {
		pagesHistory: [],
		
		addPage: function(page) {
			event.publish( (page.url == AJILE.require('mainPage'))? 'loadIndex' : 'loadPage', page);
			
			SessionHistory.pagesHistory.push(page);
			historyContainer.src = AJILE.updateComponents(historypage+'?ts="'+(new Date()).getTime()+'"&p=" "', 'p', page.url);
		}
	};
	
	var pageUpdate = function() {
		var doc = historyContainer.contentWindow.document;,
			topDoc = window.top.document;
			doc.title = topDoc.title;
		var sLoc = AJILE.getComponent(decodeURI(doc.location.search.toString()), 'p'), 
			hashLoc = AJILE.getComponent(topDoc.location.hash.toString(), 'p');
		if (!(sLoc == '' || hashLoc == '' || sLoc == hashLoc) && sLoc != AJILE.getComponent(window.top.document.getElementById('hist').src, 'p')) {
			if (AJILE.par.name.full && sLoc == AJILE.mainPage) AJILE.par.removeParSpecific();
			AJILE.page.loadPage(sLoc, window.top.AJILE.tab.currentTab.contentEle, 'FB'); 
		}
	});
	
	};

	event.subscribe(historyContainer, 'load', pageUpdate);
};