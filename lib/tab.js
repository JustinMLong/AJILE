AJILE.define({
name:'tab',
version: '1.0a10',
requirements: [], 
constructor: function() {
  var exports = {};

  var allTabs = new OrganizedList( function (newPlace) {this.id(newPlace);} ), 
    currentTab = null, permissions = {'mutable': 3, 'closeable': 5}; 

  var initRegis = function() { 
    if (request(AJILE, 'CLIENT_ID')) { request('#cliID').value = AJILE.CLIENT_ID; }
  };

  var Tab = function (contEle, per, ele, tabNameEle) {
    var tabPer = permissions, idPermiss = 1, nameEle;
    idPermiss  = (!per || per.length == 0) ? 2 :
      per.reduce(function(totPerm, nextPerm) 
        {return totPerm * permissions[nextPerm];},1
      );
    tabNameEle.id = 'N'+(allTabs.size); ele.id = 'T'+(allTabs.size);
    return new Tab(ele, contEle, tabNameEle, idPermiss);
  };

  Tab.constructor = function (ele, contEle, titleEle, perm) {
    var tabId = ele.id, loc = loc, perm = perm, contentEl = contEle, titleEl = titleEle;
    this.getPermission = function getPer(pName)
      {return (arguments.length > 0)?(perm%AJILE.tab.permissions[pName]==0):perm;};
    this.location = function()
      {return loc;};
    this.closeTab= function() {
      if (!this.getPer('closeable')) return;

      moveToTab(allTabs.check((loc||1)-1).id());
      AJILE.request('#tabs').removeChild(contentEl); 
      AJILE.request('#tabNames').removeChild(titleEl);
      AJILE.tab.allTabs.remove(loc);
    };
    this.shiftFocus = function(isGaining) 
        {[contentEl,titleEl].forEach(function(el) {el.className = el.className.replace(/ ?activeTab ?/, ((isGaining)?' activeTab':''));});}
    this.focus = function() {this.shiftFocus(true);};this.loseFocus = function() {this.shiftFocus(false);};
    return this;
  };

  Tab.prototype.id = function(setVal) { 
    if ( arguments.length > 0 ) 
      return ( this.getPermission('mutable') ) 
        ? (titleEl.id = 'N'+setVal, contentEl.id = 'T'+setVal,true) 
        : false; 
    else 
      return titleEl.innerText;
  };

  Tab.prototype.title = function(setVal) { 
    if ( arguments.length > 0 ) 
      return ( this.getPermission('mutable') ) 
        ? (titleEl.innerText = setVal) 
        : false;
    else 
      return titleEl.innerText;
  };

  Tab.prototype.content = function(setVal) {
    if ( arguments.length > 0 )
      return ( this.getPermission('mutable') ) 
        ? (contentEl.innerText = setVal) 
        : false;
    else
      return concentEl;
  };

  var initKBT = function () {
    if (document.location.hash && document.location.hash.charAt(1) == '!')
      {AJILE.initialize.initPage = document.location.hash.toString().substring(2);}

    AJILE.require('history').SessionHistory.push(new AJILE.require('history').PageEntry('tmp', AJILE.initialize.initPage||AJILE.SITE_ROOT + 'index.htm'));
  };

  var moveToTab = function (tabLoc) {
    currentTab.loseFocus();
    allTabs.check(tabLoc).focus();
    currentTab = allTabs.check(tabLoc);
  };

  var calcIframeHeight = function (tabId) {
    var footer = AJILE.request('#footer'), currId = currentTab.id();
    return AJILE.require('page').getY(footer) - AJILE.require('page').getY(tabContent) - footer.offsetHeight;
  };

  var selectTab = function (ev) {
    var selTabLocation = (ev || window.event).srcElement.id.replace('T', '');
    if (selTabLocation != currentTab.location()) {moveToTab(selTabLocation);}
  };

  setUIContent = function setMainTabCont(page, hashLoc, override) {
    if (!currentTab.getPermission('mutable')) {moveToTab(defaultTab.id());}
    currentTab.content(page.text);
    currentTab.title(page.title.replace(/.*?\:/, '')|| 'Untitled Page');
    AJILE.page.goToBookMark(hashLoc);
    AJILE.updateBreadcrumbs(page.url);
    AJILE.updateBreadcrumbs(hashLoc.replace('#', '')||'Top', true);
    AJILE.updateLocation(page, (override == 'F/B'));
    AJILE.history.SessionHistory.edit(AJILE.history.SessionHistory.size-1, page);
  },

  createTab = function makeTab(startLocation) {
    var tabContent, tabName;
    AJILE.request('#tabNames').appendChild(
      (tabName = AJILE.require('dom').div('Loading Tab', {className: 'tabName', id: 'templName', 'onclick': AJILE.tab.selectTab}))
    );
    AJILE.request('#tabs').appendChild((tabContent = AJILE.require('dom').div(
      AJILE.require('dom').div('Loading New Page', {className: 'tabContents'}), 
    {className: 'tab mutable closeable',id: 'tmpl'})));

    allTabs.push(new Tab(nTab.firstChild, ['mutable', 'closeable'], tabContent, tabName));
    moveToTab(allTabs.peek().id());
    AJILE.page.loadPage(startLocation, allTabs.peek().contentEle, 'TabAdd');
  }


initialize = function initTabs(hardLink) {
    AJILE.require('page'); AJILE.tab.initRegis();
    AJILE.tab.allTabs = new OrganizedList( function updateTabPlace(newPlace) {this.id(newPlace);} );

    $A('#tabs > div.tab').forEach(function(node) {
      var permiss = Object.keys(AJILE.tab.permissions).filter(function(perm) {return (node.className.indexOf(perm) > 0);});
      AJILE.bind($A('#'+node.id+'Name'),'click',AJILE.tab.selectTab);
      AJILE.tab.allTabs.push(new AJILE.tab.Tab($A('div', node)[0],permiss,node,$A('#'+node.id+'Name')));
      if (/activeTab/.test(node.className)) AJILE.tab.currentTab = AJILE.tab.allTabs.peek();
      if (!Array.isArray($A('form', node))) {$A('form', node).submit();}
      if (!Array.isArray($A('iframe', node))) {
        AJILE.tab.moveToTab(AJILE.tab.allTabs.size()-1);
        $A('iframe', node).height = ifrHeight;
      }
    });

    AJILE.tab.currentTab = AJILE.tab.currentTab||AJILE.tab.allTabs.check(0);

    AJILE.tab.defaultTab = AJILE.tab.allTabs.check((AJILE.tab.defaultTab||AJILE.tab.currentTab).location());
    AJILE.tab.initKBT(hardLink);
  }
}
});