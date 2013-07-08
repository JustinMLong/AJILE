AJILE.define({
  name: 'page',
  requirements: [],
  version: '1.0a10',
  constructor: function() {
    var exports = {};

    var loadPage = exports.loadPage = function (newLocation, ele) {
      if (!newLocation) return;
      newLocation = newLocation.split('#');
      var hash = (newLocation.length > 1) ? newLocation.splice(-1,1)[0] :'#';
      newLocation = newLocation[0];

      if ( (AJILE.history.SessionHistory.peek().url == newLocation) || newLocation == AJILE.SITE_ROOT) {
        goToBookMark(hash);
        AJILE.updateBreadcrumbs(hash, true);
       }
       else { AJILE.xhr(newLocation, {
         'success': function() { this.pageInfo = updatePage.apply(this,[]); },
         'error':   function() { this.pageInfo = errorPage.apply(this,[]); },
         'finally': function() { AJILE.require('tab').setUIContent(this.pageInfo,hash,override);}
       }); }
    };

    var updatePage = function () {
      var page = this.responseText;
      page = (AJILE.require('par').id)?page.replace(/\[pargroup\]/gim, AJILE.require('par').id):page;
      page = (AJILE.require('par').name)?page.replace(/\[parname\]/gim, AJILE.require('par').name):page;
      var pageInfo = new AJILE.history.PageEntry(page.getInnerHtml('title').getInnerHtml('h1'), this.requestPage), newBody;
      newBody = page.getInnerHtml('body');
      newBody = updateAttr(newBody,['href','src'], this.requestPage.split('/') );
      pageInfo.text = newBody;
      return pageInfo;
    };

    var errorPage = function() {
      var pageInfo = new AJILE.history.PageEntry('ERR: Page Not Found', this.requestPage);
      pageInfo.text = '<h1>Error ('+this.status+' ['+this.statusText+']):<br />If you think this is in error, send a bug</h1>';
      return pageInfo;
    };

    var updateAttr = exports.updateAttr = function (markupToChange,attribute,currLoc) {
      if ( Array.isArray(attribute) ) {
          attribute.forEach(function(currentAttribute) {
            markupToChange = updateAttr(markupToChange,currentAttribute,currLoc);
          });
          return markupToChange;
      }

      markupToChange = markupToChange.replace(
        new RegExp(tag+'="(?!(javascript|mailto\:))(.*?)"', 'gi'),
        function (fStr,m1, loc) {
         return  tag + '="' + relativeToAbs(loc,currLoc) +
           '" onclick="AJILE.clickHandle.apply(this, [arguments[0]]);"';
      });

      return newBody;
    };

    var relativeToAbs = function (relLink, currLoc) {
      var newHref = (relLink.indexOf('#')==0)?currLoc.join('/')+relLink:'',
        upDirC = relLink.matchCount(/\.\./g);
      if (!newHref) {
        if (relLink.indexOf('://') > -1)
          newHref = relLink;
        else {
          newHref = (currLoc.length<=1)?'':(currLoc.slice(0,-1).join('/')+'/');
          if (upDirC) {
            newHref = (newHref.split('/').
              splice(0, (((newHref.match(/\//g)||[]).length)-upDirC)).
              join('/')+ '/');
          }
          newHref += hrefCh.replace(/(\.\.\/)/g, '');
        }
      }

      return newHref;
    };

    var goToBookMark = function (bookmark) {
      var ele = document.getElementById(bookmark) ||
        document.getElementsByName(bookmark)[0];
      window.scrollTo(0,(getY(ele)-100));
    };

    var getY = function (elem) {
        if (!elem) {return 0;}
        return (elem.offsetTop+((elem.offsetParent)?(getY(elem.offsetParent)):0));
    };

    return exports;
  }
});