AJILE.define({
  name: 'dom', 
  requirements: [],
  version: '1.0a10',
  constructor: function(selector) {
    var exports = {}, 
      availableNodes = 
        provide('domShims', 'a b li ul div style table tr td th h1 tbody code');

    var domNode = function(tag, subNodes, attr) {
      var attr = attr || {}, 
        subNodeSet = (subNodes == null || !Array.isArray(subNodes))
          ? [subNodes] : subNodes,
        tmpTag = document.createElement(tag);
      Object.keys(attr).forEach(function(att) { tmpTag[att] = attr[att]; });
      subNodeSet.forEach(function(childEle) { 
        if(!childEle) return;
        tmpTag.appendChild((typeof childEle == 'string')
          ? document.createTextNode(childEle) 
          : childEle
        );
      });
      return tmpTag;
    };

    var create = exports.create = function(insertionPoint, nodeSet) {
      insertionPoint = selector.query(insertionPoint)[0];
      
    };
    
    

  // Shiv the main non-standard tags.
    ('ccint ccext').split(' ').forEach(function(nonstandard){ 
      document.createElement(nonstandard);
    });

    availableNodes.split(' ').forEach(function(elementType) { 
        exports[elementType] = function(subNodes, attr) { 
          return domNode(elementType, subNodes, attr); 
        };
    });

    return exports;
  }
});