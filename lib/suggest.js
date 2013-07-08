AJILE.define({
  name: 'suggest', 
  version: '1.0a10', 
  requirements: ['selector'], 
  constructor: function (selector) {
    var exports = {};

    var Dictionary = exports.Dictionary = (function() { 
      var terms = {};
      this.addTerm = function(word, addTerm) { 
        terms[word.charAt(0)] = terms[word.charAt(0)] || {};
        terms[word.charAt(0)][word] = terms[word.charAt(0)][word] || [];
        terms[word.charAt(0)][word][terms[word.charAt(0)][word].length] = addTerm; 
      }
      this.getTerm = function(word) { 
        if (terms[word.charAt(0)] && terms[word.charAt(0)][word])
          return terms[word.charAt(0)][word];
        return null; 
      } 
    })();

    var Term = function(term, link) { 
      return { 'term': term, 'link': link }; 
    };

    var SuggestionTier = function(txt, lowerBound, upperBound) { 
      return { 
        text: txt, 
        bounds: {upper: upperBound, lower: lowerBound}, 
        pages: [] 
      };  
    };

    var getSubListings = function(node, textSet) {
      AJILE.convertToArray(selector.query('>ul>li', node)).forEach(
        function(liNode, counter) {
          var term = liNode.innerText.trim().
            replace(/[^ 0-9a-zA-Z]/gim, ' ').trim();
        textSet = textSet.concat(term);
        if (cnter != 0) { textSet.splice(-2,1); }
        var link;
        if ((link = selector.query('>a,>b>a', liNode).innerText||'').trim() == term)
          { link = link.href; }
        textSet.join(' ').split(' ').forEach(function(word) {
          Dictionary.addTerm(word.toUpperCase(), new Term(textSet.join(' > '), link));
        });

        AJILE.suggest.getSubListings(liNode, textSet);
      });
    };

    AJILE.suggest.getSubListings(AJILE.request('#topNav'), []); 
    AJILE.bind(document, 'keydown', function(e) { 
      var event = e || window.event; 
      if (event.ctrlKey && String.fromCharCode(event.keyCode).toLowerCase() == '?') {
        AJILE.suggest.showSearch(); 

        document.defaultAction = null;
        if (e.stopPropagation) { e.stopPropagation(); }
        if (e.preventDefault) {  e.preventDefault();  }
        e.cancelBubble = true;
        return false;
      }
    });



    var createSuggestList = function (inputList) {
      var suggList = [], matchedURLs = [];
      inputList.forEach(function(word) {
        word = word.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
        if (Dictionary.getTerm(word))
          suggList.push({'word':word, 'matches':Dictionary.getTerm(word)});
      });
      return suggList;
    };

    var removeDuplicates = function(word, count, arr) {
      //TODO: implement duplicate removal
    };

    var rateSuggestions = function (suggList) {
      var maxCount = 0, hrefList = {}, 
        sugg = [
          new SuggestionTier('High Relevance', 0, 0), 
          new SuggestionTier('Medium Relevance', 0, 0), 
          new SuggestionTier('Low Relevance', 0, 0)
        ];
      suggList.forEach(function(entry) { entry.matches.forEach(function(href) { 
        hrefList[href.link] = (!hrefList[href.link])? 1 : hrefList[href.link]+1; maxCount = Math.max(hrefList[href.link], maxCount);
      });});
  //		hrefList.forEach(function(hrefCount, href) { if (hrefCount > maxCount/3) ; });
    };

    var showSearch = function() 
      { $A('#search').className += ' show'; }

    var startSearch = function() 
      { $A('#search > p').className += ' hidden'; }
  }
});