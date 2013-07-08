AJILE.define({
  name: 'styles', 
  version: '1.0a10', 
  requirements: ['dom'], 
  constructor: function(dom){
    var exports = {};

    var styleSheet = null, ssConnector = new OrganizedList(
      function(obj, id) {styles[obj.selector].index = id; obj.index = id; }
    );
    dom.create('head', 'style[type=text/css]');
    styleSheet = document.styleSheets[document.styleSheets.length-1];

    styleSheet.cssRules = styleSheet.cssRules || styleSheet.rules;
    styleSheet.deleteRule = styleSheet.deleteRule || styleSheet.removeRule;
    styleSheet.appendRule = (styleSheet.addRule)?
        ( function(sel, nStyle) { this.addRule(sel, nStyle); } ) :
        ( function(sel, nStyle) 
          { this.insertRule(sel+' {'+nStyle+'}', this.cssRules.length); } 
        );

    var Style = function (selector, styles) 
      { return { index: null, selector: selector, style: styles }; };
    var Connector = function (idx, sel)
      { return { index: idx, selector: sel}; };

    var add = exports.add = function (style) {
      if (styles[style.selector]) { changeStyle(style); }
      else {
        styleSheet.appendRule(style.selector, style.style);
        styles[style.selector] = new Style(style.selector, style.style);
        styles[style.selector].index = styleSheet.cssRules.length-1;
        ssConnector.push(new Connector(styles[style.selector].index, style.selector));
      }
    };

    var change = exports.change = function (style) {
      if (!styles[style.selector]) { return false; }
      styleSheet.cssRules[styles[style.selector].index].style.cssText = styleObj.style;
      return true;
    };

    var remove = exports.remove = function (style) {
      if (!styles[style.selector]) { return false; }
      styleSheet.deleteRule(styles[style.selector].index);
      ssConnector.remove(styles[style.selector].index);
      delete styles[style.selector];
      return true;
    };

    return exports;
  }
});