AJILE.define({
  name: 'ui', 
  version: '1.0a10',
  requirements: [],
  constructor: function() {  
    var exports = {};

    var Class = exports.Class = function(node, setValue) {
      if (arguments.length > 1) 
        { node.className = setValue; }
      else 
        { return node.className; }
    }

    Class.add = function(node, newClass) {
      if (node.className.indexOf(newClass) == -1) 
        { return !!(node.className += ' ' + newClass); }
      return false;  
    }

    Class.remove = function(node, classToRemove) {
      if (node.className.indexOf(classToRemove) >= 0)
        { return !!(node.className = node.className.replace(classToRemove, '')); }
      return false;
    }

    Class.toggle = function(node, toggleClass) {
      if (node.className.indexOf(toggleClass) == -1)
        { return !!(Class.add(node, toggleClass)); }
      else
        { return !!(Class.remove(node, toggleClass)); }
    }

    Class.has = function (node, checkClass) {
      return (node.className.indexOf(checkClass) > -1);
    }

    var setContent = exports.setContent = function(node, content, needsSanitize) {
      if (!needsSanitize) { 
        content = content.replace(/</g, '&lt;').
          replace(/>/, '&gt;').
          replace(/\"/, '&quot;'); 
      }
      node.innerHTML = content;
    }

    var updateBreadcrumbs = exports.updateBreadcrumbs = function (loc, isHash) {
       var crumb = AJILE.request('#breadcrumbs').innerHTML.toString();
       crumb = (arguments.length > 1) ?
         crumb.replace(/#.*/, ' # '+loc||'Top') :
       loc.replace(AJILE.base.HOST, '').replace(/(\/)/g, ' &gt; ');
       AJILE.request('#breadcrumbs').innerHTML = crumb;
    }

  }
});