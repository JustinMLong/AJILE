AJILE.define({
  name: 'history', 
  version: 'v1.0a10', 
  requirements: ['tab', 'dom'], 
  constructor: function(tab, dom){
  
    var exports = {};

    var historyLocation = AJILE.provide('historyLocation', '_private/blank.html');

    var SessionHistory = exports.SessionHistory = 
      new OrganizedList(function (override) {
      AJILE.require('page').
        loadPage(this.url, tab.currentTab.contentEle, override);
    });

    var PageEntry = exports.PageEntry = function (pageTitle, pageURL) 
      { return {title: pageTitle, url: pageURL}; }

    return exports;
  }
});