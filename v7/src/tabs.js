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
