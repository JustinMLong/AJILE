AJILE.define({
  name: 'selector',
  version: '1.0a10',
  requirements: [],
  constructor: function(){
    var exports = {};

    var selectors = {
      ' ': {
        'type': 'Descendant',
        'returnNodes': function(Selector, context) {
          return (context.getElementsByTagName(Selector.element).length != 0) ?
            context.getElementsByTagName(Selector.element) :
            null;
        }
      },

      '>': {
        'type': 'Child',
        'returnNodes': function(Selector, context) {
            var tmpArr = AJILE.convertToArray(context.childNodes).filter(function (childNode) { return (isSameEleType(Selector, childNode)); });
            return (tmpArr.length != 0) ? tmpArr: null;
        }
      },

      '+': {
        'type': 'Adjacent Sibling',
        'returnNodes': function(Selector, context) {
          var nextNode = (context.nextNode.outerHTML)?context.nextNode:context.nextNode.nextNode;
          return (isSameEleType(Selector, nextNode))?nextNode: null;
        }
      },

      '~': {
        'type': 'General Sibling',
        'returnNodes': function(Selector, context) {
          var tmpArr = [], nextNode;
          while ((nextNode = context.nextNode) != null)
            if (isSameEleType(Selector, nextNode)) tmpArr.push(nextNode);

          return (tmpArr.length != 0) ? tmpArr: null;
        }
      },

      '[': {
        'type': 'Attribute',
        'isValid': function(Psuedo, Selector, context, topContext) {
          var attr = Psuedo.element.split('='), isVal = false, reg = null;
          switch (attr[0].charAt(attr[0].length-1)) {
            case '~': reg = [' ',  null, ' ' ]; break;
            case '|': reg = ['^ ', null, '-?']; break;
            case '^': reg = ['^ ', null, null]; break;
            case '$': reg = [null, null, ' $']; break;
            case '*': reg = [null, null, null]; break;
            default:  reg = ['^ ', null, ' $']; break;
          }
          reg[1] = (attr.length > 1)?RegExp.escapeText(attr[1]):'.*';
          isVal = ((new RegExp(reg.join(''), 'g')).test(' '+context[attr[0].substring(0,attr[0].length-1)]+' '));

          return (isVal)?context:null;
        }
      },

      ':nth-child': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: nth-child selector
          return;
        }
      },

      ':nth-last-child': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: nth-last-child selector
          return;
        }
      },

      ':nth-of-type': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: nth-of-type selector
          return;
        }
      },

      ':nth-last-of-type': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: nth-last-of-type selector
          return;
        }
      },

      ':has': {
        'type': 'Container Psuedo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: rework has selector
          return ((query(Psuedo.element, context).length == 0)?null:Psuedo);
        }
      },

      ':has-immediate': {
        'type': 'Parent Container Psuedo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: write has-immediate selector
          return;
        }
      },

      ':not': {
        'type': 'Negation Psuedo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: not selector
          return;
        }
      },

      ':first-child': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: first-child selector
          return;
        }
      },

      ':last-child': {
        'type': 'Structural Pseudo',
        'isValid': function(Psuedo, Selector, context, topContext) {
          //TODO: last-child selector
          return;
        }
      }
    };

    var Selector = function(selector, element)
      { return { 'selector': selector, 'element': element, 'psuedo': [] }; };

    exports.query = function(selector, context) {
      var resSet = [], tmpSel = [];
      standardizeSelector(selector).split(',').forEach(function(sel) {
          if (/\\$/.test(sel))
              { tmpSel.push(sel); }
          else
              { tmpSel[tmpSel.length-1] += sel; }
      });
      tmpSel.forEach(function(sel) {
        var selectorSet = parseSelector(sel);

        context = (/^#/.test(selectorSet[0].element))?document.getElementById(selectorSet.shift().element.substring(1)) :
          (!!context)?((Array.isArray(context))?context[0]:context):document;

        resSet = resSet.concat(evaluateSelectorTree(selectorSet, [context]));
      });
       if (resSet && resSet.length==1 && !wantArr) { resSet = resSet[0]; }
       else if (resSet == null || resSet[0] == null) resSet = [];
      return resSet;
    };

    var evaluateSelectorTree = function(selectorTree, context) {
      selectorTree.forEach(function(Selector) {
        var contextL = context.length;
        context.forEach(function(currContext) {
          var tmpRes = AJILE.convertToArray(selectors[Selector.selector].returnNodes(Selector, currContext))||[];
          if (Selector.psuedo) Selector.psuedo.forEach(function(currPsuedo) {
            var tmpResL = tmpRes.length;
            tmpRes.forEach(function(currPsueContext, loc) {
              if (selectors[currPsuedo.selector].isValid(currPsuedo, Selector, currPsueContext, currContext) != null)
                { tmpRes = tmpRes.concat(currPsueContext); }
            });
            tmpRes.splice(0,tmpResL);
          });
          context = context.concat(tmpRes);
        });
        context.splice(0, contextL);
      });
      return context;
    };

    var standardizeSelector = function(selector) {
      selector = (selector.lastIndexOf('#') > -1)?selector:selector.substring(selector.lastIndexOf('#'));
      selector = selector.replace(/\s/gm, ' ').replace(/ +/gm, ' ').trim();
      Object.keys(selectors).forEach(function(sel) {
        if (/^[^: ]/.test(sel)) selector = selector.replace(new RegExp(' ?'+RegExp.escapeText(sel)+' ?', 'gim'), sel);
      });
      selector = selector.replace(/\.([a-zA-Z0-9]*)/g, '[className~=$1]');

      return selector;
    };

    var parseSelector = function(selector) {
      var selector = ((!(selector.charAt(0) in selectors || selector.charAt(0)==':'))?' ':'') + selector + ' ', selSet = [],
          skipCount = -1, selReg = new RegExp('((' + RegExp.escapeText(Object.keys(selectors).join(',,')).split(',,').join(')|(') + '))', 'gim');
       selector.match(selReg).forEach(function(selMatch, loc, arr) {
         if (skipCount-- > 0) { if (skipCount != 0) {return;} else {selSet.push(new ASelector(selMatch, ''));} }
         selSet.push(new Selector(selMatch, ''));

         if (selSet.length == 1) return;
         selSet[selSet.length-2].element = selector.substring(selSet[selSet.length-2].selector.length, selector.indexOf(selMatch,1))||'*';

        selector = selector.substring(selector.indexOf(selMatch,1));
         if (/^:|\[/.test(selMatch)) {
           var endToken = (selMatch=='[')?']':')', charLoc = selector.indexOf(endToken);
           while (selector.charAt(charLoc-1) == '\\') charLoc = selector.indexOf(endToken, charLoc+1);
           skipCount = selector.substring(0,charLoc+1).match(selReg).length;
           selSet[selSet.length-1].element = selector.substring(selMatch.length+((endToken==')')?1:0),charLoc);
           selSet[selSet.length-2].psuedo.push(selSet.splice(-1,1)[0]);
           selector = selector.substring(charLoc);
         }

         if (skipCount == 0) selSet.pop();
      });
      selSet.pop();
      return selSet;
    };

    var isSameEleType = function(Selector, tstNode) {
      var ele = Selector.element.toLowerCase();
      return (tstNode.tagName && (tstNode.tagName.toLowerCase() == ele) || ele == '*');
    };

    return exports;
  }
});