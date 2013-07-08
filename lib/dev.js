AJILE.define({
  name: 'dev', 
  version: '1.0a10', 
  requirements: ['styles', 'dom'], 
  constructor: function(styles, dom) {
    var exports = {}; 

    var isDev = provide('dev.isDev', getComponent(request(AJILE, 'initArgs'),'dev'));

    updateStatus(request(AJILE, 'IS_INTERNAL'), 'ccint');
    updateStatus(request(AJILE, 'IS_EXTERNAL'), 'ccext');

    if (isDev)
      require('ui').Class.add('body', 'dev');

    exports.initSpider = function(isDeep) {
      AJILE.request('#navigation a').forEach(function(menuLink) {
        spiderPage(menuLink.href, 'Top Menus', menuLink.innerText, isDeep);
      }); 
    };

    var spiderPage = function (loc, page, inTxt, isDeep) {
      loc = loc.replace(/#(.*?)$/, '');
      if (spiderPage[loc]) { return; } 
      else { spiderPage[loc] =  true; }

      if (loc.indexOf(AJILE.getProperty('HOST')) > -1 ) { 
        AJILE.xhr(loc, {
          'finally': function() { linkStat.call(this, loc, page, inTxt); },
          'type': (isDeep) ? 'GET' : 'HEAD'
        }); 
      }
      else { 
        reportNavChecks({ sev: 'ext', loc: loc, pg: page, inTxt: inTxt });
      }
    };

    var linkStat = function(loc, page, inTxt) {
      if (!/^[23]/.test(this.status)) {
        reportNavChecks({ sev: 'error', loc: loc, pg: page, inTxt: inTxt }); 
      }
      else if (this.responseText != '') { 
        scrubPage(AJILE.require('page').updatePage.apply(this, [loc])); 
      }
    };

    var scrubPage = function(responsePage) {
      responsePage.text.replace(/href="(.*?)".*?>(.*?)<\/a>/gim, 
        function(fStr, mLoc, mText) {
          spiderPage(mLoc, responsePage.title, mText, true);
        });
    };

    var reportNavChecks = function (errObj) {
//      AJILE.require('dom').create('#'+errObj.sev+'Table', 'tr>td[content="$1"]',
//        [[errObj.pg, errObj.loc.replace(/\?.*$/, ''), errObj.inTxt]]);
      var table = AJILE.request('#'+errObj.sev + 'Table');
      table.tBodies[0].appendChild(dom.tr([
        dom.td(""+errObj.pg),
        dom.td(""+errObj.loc.replace(/\?.*$/, '')),
        dom.td(""+errObj.inTxt)
      ]));
    };

    var updateStatus = function (isCh, loc) { 
      styles.add(new styles.Style(loc, ('display: '+((isCh)?'block':'none') )));
    };

  }
});