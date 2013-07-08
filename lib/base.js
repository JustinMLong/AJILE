AJILE.define({
  name: 'base', 
  version: '1.0a10', 
  requirements: [], 
  constructor: function() {
    var exports = { };

    var HOST = provide('HOST', document.location.protocol+'//'+document.location.host+'/'),
    SITE_ROOT = provide('SITE_ROOT', location.href.replace(/#.*$/g, '').replace(/\?.*$/g, '').replace(/[^\/]*$/, '')),
    LOCAL_ENVIRONMENTS = provide('LOCAL_ENVIRONMENTS', ['empsvcs', 'review', 'localhost']),
    VERSION_NUMBER = provide('VERSION_NUMBER', '8a10'),
    IS_INTERNAL = provide('IS_INTERNAL', (new RegExp('('+(LOCAL_ENVIRONMENTS.join(')|(')+')'), 'i').test(SITE_ROOT))),
    IS_EXTERNAL = provide('IS_EXTERNAL', !IS_INTERNAL);

    var clickHandle = exports.clickHandle = function (ev) {
      var event = ev || window.event, targ = this.href;
  //    if ( (!e.which && e.button == 4) || e.which == 2)
  //    	{  AJILE.tab.createTab(targ); }

      if (isWithinAJILEDomain(targ) && this.target != '_blank') {
        if (event.shiftKey || event.ctrlKey)
          { AJILE.require('tab').createTab(targ); }
        else
          { AJILE.require('page').loadPage(targ, AJILE.tab.currentTab.contentEle); }

        if (event.preventDefault)
          event.preventDefault();
        else
          event.returnValue = false;
      }
      else 
        { this.target = '_blank'; }
    };

    var updateLocation = exports.updateLocation = function (page, noHist) {
      document.location.hash = AJILE.updateComponents(document.location.hash.toString(),'p',page.url);
      document.title = page.title;
      if (!noHist)
        request('#hist').src = AJILE.getProperty('historyLocation') + 
          '?cbreak=' + Date.now() + '&p="'+encodeURI(page.url) + '"';
    };

    var delay = exports.delay = function (fRef, mDelay) {
      var argu = Array.prototype.slice.call(arguments,2);
      return window.setTimeout((function(){fRef.apply(null, argu);}), mDelay);
    };

    var cancelExecution = exports.cancelExecution = function (timeoutId) {
      window.clearTimeout(timeoutId);
    };

  // TODO Go into dom?
    var bind = exports.bind = function (obj,type,fn) {
      if (obj.addEventListener) 
        { obj.addEventListener(type, fn, false); }
      else if (obj.attachEvent) 
        { obj.attachEvent('on'+type,fn); }
      else 
        { obj['on'+type] = fn; }
      return obj;
    };

  // TODO go into dom?
    var unbind = exports.unbind = function (obj,type,fn) {
      if (obj.removeEventListener) 
        { obj.removeEventListener(type, fn, false); }
      else if (obj.detachEvent) 
        { obj.detachEvent('on'+type,fn); }
      else 
        { obj['on'+type] = function() {}; }
      return obj;
    };

    var convertToArray = exports.convertToArray = function (arrSet) { 
      var tmp = [];
      if (!arrSet) return null;
      else if ('length' in arrSet) {
        for (var i =0; i < arrSet.length; tmp[i] = arrSet[i++]) ;
      }
      else 
        { tmp[0] = arrSet; }
      return tmp; 
    };

    var xhr = exports.xhr = function (loc, settings, args) {
      var xhr   = new XMLHttpRequest(), 
          success = settings['success'] || function(){},
          error   = settings['error']   || function(){},
          compl   = settings['finally'] || function(){},
          reqType =(settings['type']    || 'get').toUpperCase(),
          xhrArgs = Array.prototype.slice.call(arguments, 2);
      xhr.requestPage = loc;
      xhr.onreadystatechange = function() {if (this.readyState == 4) {
          (/^[23]/.test(this.status))?
            ( success.apply(xhr, xhrArgs) ) :
            ( error.apply(xhr, xhrArgs) );
          compl.apply(xhr, xhrArgs);
      }};
      xhr.open(reqType, loc+'?'+(new Date()).getTime(), true);
      xhr.send('');
    };

    var isWithinAJILEDomain = exports.isWithinAJILEDomain = function(href) {
      //Check link type, if not same origin, return false
      if (href.indexOf(':') > -1 && href.indexOf(document.location.protocol + '//' + document.location.host) == -1)
        return false;
      if (!(/htm(l)?/i.test(href.replace(/#.*$/, '').match(/.*(\..*)$/)[1])))
        return false;
      if (href.indexOf('counselor_news') > -1)
        return false;
      return true;
     };

    var updateComponents = exports.updateComponents = function (str, field, value) {
      str = (str || '?'+field+'=" "');
      str += (!(new RegExp('[?&]'+field+'=', 'i')).test(str))? ('&'+field + '=" "'): '';
      return (str = str.replace(new RegExp('([?&])'+field+'=".*?"', 'im'), '$1'+field+'="'+encodeURI(value)+'"'));
    };

    var getComponent = exports.getComponent = function (str, field) { 
      return (!(new RegExp('[?&]'+field+'[&=]', 'i')).test(str||''))?
        null:
        (str.replace(new RegExp('.*[?&]'+field+'="(.*?)".*', 'i'), '$1')); 
    };


    var initialize = exports.initialize = function() {
      Object.keys(AJILE.base).forEach(function(prop) {AJILE[prop] = AJILE[prop] || AJILE.base[prop];});
      Object.keys(AJILE.options).forEach(function(prop) { 
        var obj = AJILE; 
        prop.split('.').slice(0,-1).forEach(function(term) {obj = obj[term];});
        obj[prop.split('.').slice(-1)[0]] = AJILE.options[prop];
      });
    };

  return exports;

  }
});