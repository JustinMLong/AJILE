AJILE.define({
  name: 'menu',
  version: '1.0a10',
  requirements: ['ui', 'selector'], 
  constructor: function(ui, selector) {

    AJILE.provide('timeInLength', 300);
    AJILE.provide('timeOutLength', 1500);

    var timeInLength = provide('timeInLength', 300),
        timeOutLength = provide('timeOutLength', 1500),
        topMenu = { open: [], timeOut: timeOutLength, timeIn: timeInLength },
        subMenu = { open: [], timeOut: timeOutLength, timeIn: timeInLength },
        currLockedMenu = null;

    var toggleTop = function (mouseEvent) 
      { toggleMenu.apply(this, [mouseEvent||window.event, true]); }
    var toggleSub = function (mouseEvent) { 
      if (!currentLockedMenu) 
        toggleMenu.apply(this, [mouseEvent||window.event, false]); 
    }

    var toggleMenu = function (mouseEvent, isTop) {
      var isOpening = (/over/.test(mouseEvent.type)),
        menuObj = (isTop)?topMenu:subMenu;
      if (isOpening && !(menuObj.open[0] &&  menuObj.open[0] == this)) 
        {menuObj.open.push(this);}
      if ( menuObj.open.length > 1 )
        {clearOpen(1,menuObj.open);}
      if (isOpening) {
        clearTimeout(menuObj.timeOut);
        menuObj.timeIn = AJILE.delay(changeMenu, timeInLength, menuObj.open[menuObj.open.length-1],true);
      }
      else { 
        clearTimeout(menuObj.timeIn);
        menuObj.timeOut = window.setTimeout(clearOpen, timeOutLength,isTop); 
      }
    }

    var openMenu = function (isTop) { 
      changeClass(((isTop)?topMenu:subMenu).list, true); 
    };

    var triggerExpand = function () {
      ui.setContent(ele, (this.innerHTML == '+')?'-':'+');
      ui.Class.toggle(AJILE.request('>ul', this.parentNode), 'bl');
      return false;
    };

    var clearOpen = function (isTop) {
      AJILE.menu.changeClass(AJILE.menu['active'+((isTop)?'Top':'Sub')+'Menu'].list, false);
      AJILE.menu['active'+((isTop)?'Top':'Sub')+'Menu'].list = null;
    };

  // Initialization code
    AJILE.request('a').filter(function(a) { return a.onclick || a.target; }).
			forEach(function(a) { AJILE.bind(a, 'click', AJILE.clickHandle); });

    AJILE.request('#navigation > li').forEach(function(navEl, cnt, arr) {
      if (cnt*2 >= arr.length)
        {ui.Class.add(navEl, 'right');}
      if (cnt > arr.length/3 && cnt < Math.floor(arr.length*2/3)) 
        {ui.Class.add(navEl, 'mid');}

      selector.query('li.single, li.sublist > ul > li', navEl).forEach(function(listItem) {
        var subjectLink = selector.query('> a', listItem);
        AJILE.bind(listItem, 'mouseover', toggleTop);
        AJILE.bind(listItem, 'mouseout',  toggleSub);
        AJILE.bind(listItem, 'click', toggleLock)
        if (!Array.isArray(subjectLink)) {
          AJILE.unbind(subjectLink, 'click', AJILE.clickHandle);
          subjectLink.href = null;
        }

        selector.query('span.arrow', listItem, true).forEach(function(expandNode){
          AJILE.bind(expandNode.parentNode, 'click', triggerExpand);
        });

      });
    });

  }
});