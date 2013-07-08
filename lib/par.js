AJILE.define({
  name: 'par', 
  version: '1.0a10', 
  requirements: ['page', 'selector', 'dom'], 
  constructor: function(page, selector, dom) {
    var id = null, name = null,
      queryString = provide('queryString', 'pargroup'),
      menuName = provide('menuName', '_private/menus/par_menu/menu_[pargroup].htm'),
      indexName = provide('indexName', '_private/pargroups/index_[pargroup].htm');

    var loadParMenu = function() {
      AJILE.xhr(menuName, {
        'success':function() {
          dom.create('#footer', 'div#oldMenuHolder[content="$1"]', [AJILE.request('#navigation').innerHTML]);

          AJILE.reqest('#topNav').innerHTML = page.updatePage.apply(this,[]).text;
          AJILE.menu.initialize();
        }
      });
    };

    var updateBanner = function () {
      AJILE.request('a').slice(0,2).forEach(function(anTag) { 
        AJILE.bind(anTag, 'click', removeParSpecific); 
        anTag.href = AJILE.SITE_ROOT; 
      });
//      AJILE.require('dom').create('#topLinks>li:first-child', '+li>a[href=$1][onclick=$2]',[indexName, AJILE.clickHandle]);

      AJILE.request('#topLinks').insertBefore(dom.li(dom.a('Group Home', {'href': AJILE.par.indexName, 'onclick': AJILE.clickHandle})),AJILE.request('#topLinks li')[1]);
    };

    var removeParSpecific = function () {
      $A('a').slice(0,3).forEach(function(anTag, count) { 
        if (count == 2) anTag.parentElement.parentElement.removeChild(anTag.parentElement);
        else { 
          AJILE.bind(anTag, 'click', function(){return AJILE.clickHandle();}); 
          anTag.href = AJILE.SITE_ROOT+'index.htm'; 
        }
      });

      request('#navigation').innerHTML = $A('#oldMenuHolder').innerHTML;
      document.location.hash = '';
      AJILE.convertToArray(AJILE.styles.styles).forEach(function(style) { AJILE.styles.removeStyle(style) });
      AJILE.menu.initialize();
      AJILE.require('page').loadPage('index.htm', AJILE.tab.currentTab.contentEle, 'restart');
      name = null; id = null;
    };

    var loadParticipationGroup = function() {

    };

    var initialize = function () {
      if (!(AJILE.par.id))
        { return; }

      $A('#header').innerHTML = AJILE.page.updateAttr($A('#header').innerHTML, 'href', []);
      AJILE.convertToArray($A('#gourl').options).forEach(function(parname) {
        AJILE.styles.addStyle(new AJILE.styles.Style('.'+parname.value, 'display: none !important;')); 
        AJILE.styles.addStyle(new AJILE.styles.Style('.not-'+parname.value, 'display: block !important;'));
      });
      AJILE.styles.addStyle(new AJILE.styles.Style('body .'+AJILE.par.name, 'display: block !important;'));
      AJILE.styles.addStyle(new AJILE.styles.Style('body .not-'+AJILE.par.name, 'display: none !important;'));

      AJILE.par.loadParMenu();
      AJILE.par.updateBanner();

      if (AJILE.dev.isDev && document.location.hash && document.location.hash.toString().indexOf('#!')==0)
        { AJILE.initialize.initPage = document.location.hash.toString().substr(2); }
       else
         { AJILE.initialize.initPage = AJILE.par.indexName; }
    };

    var detectSubGroups = function detectSubs(select) {
      if (select.value.indexOf('[refer]') > -1) {
        var group = select.value.split(' ')[1];
        $A('#'+group).className += ' showGroup';
      }
    };

    var handlePar = function handlePar(ev) {
      var ev = ev || window.event, goUrl = $A('#gourl'), id = ev.srcElement.className.replace(/ ?visi ?/, ''), name = ev.srcElement.innerText;
      document.location.hash = 'id="'+encodeURI(id)+'"&name="'+encodeURI(name) +'"&p=""';
      AJILE.par.id = /id="(.*?)"/i.exec( decodeURI(document.location.hash.toString()) )[1];
      AJILE.par.name =/name="(.*?)"/i.exec( decodeURI(document.location.hash.toString()) )[1];
      AJILE.par.initialize();
      AJILE.tab.initKBT(AJILE.nextPage);

    }
  }
});



AJILE.par.BETA = {
  showPars: function(typedEntry) {
    $A('#testCombo').className = 'written';
    var ulHolder = $A('#testComboGroups'), isShowingAll = (typedEntry == '**' && ulHolder.className.indexOf('visi') > -1), matched = [];
    if (typedEntry.length > 0 && $A('#testComboGroups').className.indexOf('visi') < 0)
      { ulHolder.className = ulHolder.className.replace(/ ?visi ?/, '') + (!isShowingAll)?' visi':''; }
    var typedReg = new RegExp(RegExp.escapeText(typedEntry), 'gi');
    $A('> li',ulHolder).forEach(function(liNode) {
      liNode.className = liNode.className.replace(/ ?visi ?/, '');
      if (typedReg.test(liNode.innerText) || typedReg.test(liNode.className) || (typedEntry == '**' && !isShowingAll))
        { liNode.className += ' visi'; matched.push(liNode); }
    });

  }
		
};