AJILE.par = {

	name: {full: null, sub: null, top: null, common: null}, pargroups: [],
	queryString: null, menuName: null, indexName: null, subSplitter: '-',

	loadParMenu: function() {
		var xhttp_menu = new XMLHttpRequest();

		xhttp_menu.open('GET',AJILE.par.replaceParValues(AJILE.par.menuName),AJILE.isAsync);
		xhttp_menu.onreadystatechange = function() {
			if ( xhttp_menu.readyState == 4 && (xhttp_menu.status == 200 || xhttp_menu.status == 304) ) {
			document.getElementById('footer').appendChild($A.div(null, { id: 'oldMenuHolder' }));
				document.getElementById('oldMenuHolder').innerHTML = document.getElementById('navigation').innerHTML;
				document.getElementById('navigation').innerHTML = '';

		var response = AJILE.page.updatePage.call(xhttp_menu, AJILE.par.menuName);
				document.getElementById('topNav').innerHTML = response.text;
				AJILE.menu.initialize();
			}
		};

		xhttp_menu.send('');
	},

	updateBanner: function() {
		var par_list = $A.li($A.a('Group Home', {href: AJILE.par.replaceParValues(AJILE.par.indexName), onclick: AJILE.clickHandle}));

		var firstList = document.getElementById('header').getElementsByTagName('ul')[0],
			newsLi = document.getElementById('header').getElementsByTagName('li')[1],
			firstA = document.getElementsByTagName('a')[0], secondA = document.getElementsByTagName('a')[1];

		firstA.onclick = secondA.onclick = function() { AJILE.par.removeParSpecific(); AJILE.clickHandle.apply(this); return false;};
		firstA.target = secondA.target = '_parent';
		firstA.href = secondA.href = AJILE.mainPage;
		firstList.insertBefore(par_list,newsLi);
	},

	removeParSpecific: function() {
	if (!AJILE.par.name.full) return;
		var anc = document.getElementsByTagName('a');
		anc[0].href = anc[1].href = AJILE.mainPage;
		AJILE.bind([anc[0], anc[1]], 'click', AJILE.clickHandle);

		anc[2].parentElement.parentElement.removeChild(anc[2].parentElement);
	if (document.getElementById('oldMenuHolder'))
		document.getElementById('navigation').innerHTML = document.getElementById('oldMenuHolder').innerHTML;
		document.location.hash = '';
		AJILE.styles.removeByTag('par');

		AJILE.ui.Class.remove(document.body, AJILE.par.name.full);
		AJILE.menu.initialize();
		Object.keys(AJILE.par.name).forEach(function(component) { AJILE.par.name[component] = null; });
		AJILE.initialize.firstPage = null;
	},

	loadParInfo: function(parName) {
		if (!parName.full) return;
		AJILE.require('styles');
		var hardLink = (AJILE.dev.isDev && document.location.hash)? document.location.hash.toString(): '',
			pargroups = AJILE.par.pargroups || document.getElementById('gourl').options;
		pargroups.forEach(function(par) {
		if (par.subGroups) {
		AJILE.styles.add('.'+par.subGroups[0].value.split('-')[0], 'display: none !important;', 'par'); 
		AJILE.styles.add('.not-'+par.subGroups[0].value.split('-')[0], 'display: inline-block !important;', 'par');
		par.subGroups.forEach(function(subGroup) {
			AJILE.styles.add('.'+subGroup.value, 'display: none !important;', 'par'); 
			AJILE.styles.add('.not-'+subGroup.value, 'display: inline-block !important;', 'par');
		});
		}
		else {
			AJILE.styles.add('.'+par.value, 'display: none !important;', 'par'); 
			AJILE.styles.add('.not-'+par.value, 'display: inline-block !important;', 'par');
		}
		});

	Object.keys(parName).filter(function(unit) { return !!parName[unit] && unit != 'common'; }).forEach(function(unit) {
		AJILE.styles.add('body .'+parName[unit], 'display: inline-block !important;', 'par');
		AJILE.styles.add('body .not-'+parName[unit], 'display: none !important;', 'par');
		AJILE.styles.add('.'+parName[unit], 'display: inline-block !important;', 'par');
		AJILE.styles.add('.not-'+parName[unit], 'display: none !important;', 'par');
		AJILE.ui.Class.add(document.body, parName[unit]);
	});

		AJILE.par.loadParMenu();
		AJILE.par.updateBanner();
		AJILE.initialize.firstPage = AJILE.par.replaceParValues(AJILE.initialize.firstPage||AJILE.par.indexName);
	},

	forceToGroup: function(parName) {
		AJILE.mainPage = AJILE.par.replaceParValues(AJILE.par.indexName);
	var ancs = document.getElementsByTagName('a');
		AJILE.isAsync = false;
		AJILE.par.handlePar(parName);

		AJILE.event.subscribe('loadIndex', function() { AJILE.par.forceToGroup(parName); });
		for (var i = 0; i < 3; i++) ancs[i].href = AJILE.mainPage;
		ancs[2].parentElement.parentElement.removeChild(ancs[2].parentElement);
	},

	replaceParValues: function(str) {
		str = str.replace(/\[pargroup\]/g, AJILE.par.name.full);
		str = str.replace(/\[topgroup\]/g, AJILE.par.name.top);
		str = str.replace(/\[subgroup\]/g, AJILE.par.name.sub);
		str = str.replace(/\[parname\]/g, AJILE.par.name.common);
		return str;
	},

	initialize: function() {
		AJILE.par.queryString = AJILE.define('par.queryString', 'pargroup=[pargroup]');
		AJILE.par.menuName = AJILE.define('par.menuName', AJILE.siteRoot+'_private/menus/par_menu/menu_[pargroup].htm');
		AJILE.par.indexName = AJILE.define('par.indexName', AJILE.siteRoot+'_private/pargroups/index_[pargroup].htm');
		AJILE.event.subscribe('loadIndex', AJILE.ui.createParBox);
		AJILE.event.subscribe('loadIndex', AJILE.par.removeParSpecific);

		if (AJILE.getComponent(AJILE.initialize.initArgs, AJILE.par.queryString))
			AJILE.par.handlePar(AJILE.getComponent(AJILE.initialize.initArgs, AJILE.par.queryString));
		else if (AJILE.par.name.full)
			AJILE.par.loadParInfo(AJILE.par.name.full);
	},

	handlePar: function(parName) { 
		AJILE.require('tab')
		if (~parName.indexOf(AJILE.par.subSplitter)) {
			AJILE.par.name.top = parName.split(AJILE.par.subSplitter)[0];
			AJILE.par.name.sub = parName.split(AJILE.par.subSplitter)[1]
		}
		AJILE.par.name.full = parName;
		//try to get the user friendly name, if that fails add generic "Current group"
		AJILE.par.name.common = (AJILE.par.pargroups)? 
			(AJILE.par.pargroups.filter(function(group) { return ~('par-'+parName).indexOf(group.tag.trim()); })[0]||{text: 'Current Group'}).text.replace(/\[.*?\]/gim, '').trim() :
			'Current Group';

		document.location.hash = AJILE.par.replaceParValues(AJILE.par.queryString)+'&p=" "';
		AJILE.par.loadParInfo(AJILE.par.name);
		AJILE.tab.initKBT();
	}
	
	var createParBox = exports.createParBox = function() {
		var list, parInfo = [], form;
		if (! ((list = document.getElementById('gourl')) && (form = list.parentNode)) ) return;
		 while (form.tagName.toUpperCase() != 'FORM' && (form = form.parentNode)) ;
		form.onsubmit = function() { return false; };

		 for (var i=0; i < list.children.length; i++) {
		if (list.children[i].value && list.children[i].value == '#') continue;
		if (list.children[i].nodeName.toUpperCase() == 'OPTGROUP' && list.children[i].label) {
		parInfo.push({ text: list.children[i].label, subGroups: [], disabled: list.children[i].disabled });
			for (var j=0; j < list.children[i].children.length; j++)
				parInfo[parInfo.length-1].subGroups.push({ 
			text: list.children[i].children[j].text, 
			tag: 'loc-'+i+'-'+j+' par-'+list.children[i].children[j].value, 
			value: list.children[i].children[j].value,
			disabled: list.children[i].disabled || list.children[i].children[j].disabled || 
				~(' '+list.children[i].className+' ').indexOf(' future ') || ~(' '+list.children[i].children[j].className+' ').indexOf(' future ')
			});
		}
		else
		parInfo.push({ text: list.children[i].innerText, 
			tag: ' par-'+list.children[i].value+' '+list.children[i].className, 
			value: list.children[i].value,
			disabled: list.children[i].disabled || ~(' '+list.children[i].className+' ').indexOf(' future ')
		});
		}
		 AJILE.par.pargroups = parInfo;
		 list.parentNode.insertBefore(createComboBox('Begin typing name of pargroup or click the arrow to choose from a list', parInfo, 
			function(){ var el = (arguments[0]||window.event).srcElement; if (Class.has(el, 'par-')) AJILE.par.handlePar(/par-([^ ]*)/.exec(el.className)[1]); }), list);
		list.parentNode.removeChild(list.nextSibling.nextSibling);
		list.parentNode.removeChild(list);
		AJILE.event.publish('parBoxCreated');
	}

	var createComboBox = exports.createComboBox = function(initMessage, listInfo, action) {
		var input = $A.input(null, {
		onkeydown: function(ev) { ev = ev||window.event; comboTyping(ev, this, this.nextSibling.nextSibling.nextSibling); },
		onkeyup: function(ev) { ev = ev||window.event; comboTyping(ev, this, this.nextSibling.nextSibling.nextSibling); },
		onfocus: function(ev) { ev = ev||window.event; 
			Class.add(this.nextSibling.nextSibling.nextSibling, 'focused-0');
			Class.add(this, 'written'); 
			comboTyping({}, this, this.nextSibling.nextSibling.nextSibling); 
		},
		onclick: function(ev) { ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; },
		className: 'comboBox' }),
			text = $A.span(initMessage, {onclick: function(ev) { ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; this.previousSibling.focus(); } }),
			dropDown = $A.span(null, {innerHTML: '&#9660;', className: 'downArrow', 
		onclick: function(ev) {
			ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; 
			this.previousSibling.onclick(); 
			showSelections(this.previousSibling.previousSibling, '', this.nextSibling); 
		} 
		}),
			list = $A.ul(null, {className: 'comboList', onclick: function(ev) { 
		 ev = ev||window.event; ev.stopPropagation && ev.stopPropagation(); ev.cancelBubble=true; 
		 action.apply(this, [].slice.apply(arguments, [0])); return false; 
		} }),
		loc = 1;

		listInfo.forEach(function(group) {
		var subUnit = [[group.text]];
		if (group.subGroups)
			subUnit[0].push( $A.ul(group.subGroups.filter(function(subGroup) { return !subGroup.disabled; }).map(function(subGroup) { return $A.li(subGroup.text, {className: subGroup.tag}); })) );
		
		if (!group.disabled) {
			subUnit.push (group.subGroups?{className: 'toplevel'}:{className:('loc-'+loc++) + ' ' + group.tag});
			list.appendChild($A.li.apply(null, subUnit));
		}
		});

	AJILE.bind(document, 'click', function(ev) { 
		Class.remove(input, 'written'); 
	});

		return $A.div([input, text, dropDown, list], {className: 'comboGroup', onblur: function() {
			var input = this.childNodes[0], list = this.childNodes[3];
			input.value = ''; Class.remove(input, 'written');
			showSelections(input, '', list); Class.remove(list, /focused-\d+/i);
		}
	});
	
	var comboTyping = function(ev, input, list) {
		var shown = (input.showing||'').split(','), focus = +(/focused-(\d+)/.exec(list.className)[1]), 
		thisNode = (~focus)?(~shown[focus].indexOf('-')?list.children[shown[focus].split('-')[0]-1].getElementsByTagName('li')[shown[focus].split('-')[1]]:list.children[shown[focus]-1]):null,
		nextNode;
		switch (ev.keyCode) {
			case (38): { 
				if (focus != 0 && /down/i.test(ev.type)) {
					nextNode = ~shown[focus-1].indexOf('-')?list.children[shown[focus-1].split('-')[0]-1].getElementsByTagName('li')[shown[focus-1].split('-')[1]]:list.children[shown[focus]-2];
					list.scrollTop -= thisNode.offsetHeight;

			Class.remove(thisNode, 'focused'); 
					Class.add(nextNode, 'focused');
					list.className = list.className.replace(/focused-(\d+)/, 'focused-'+(focus-1));
					return false;
				}
				break;
			}; //up
			case (40): {
				if (focus != shown.length-1 && /down/i.test(ev.type)) {
			nextNode = ~shown[focus+1].indexOf('-')?list.children[shown[focus+1].split('-')[0]-1].getElementsByTagName('li')[shown[focus+1].split('-')[1]]:list.children[shown[focus]];
			list.scrollTop += thisNode.offsetHeight;

					Class.remove(thisNode, 'focused'); 
					Class.add(nextNode, 'focused'); 
					list.className = list.className.replace(/focused-(\d+)/, 'focused-'+(focus+1));
					return false;
				}
				break;
			}; //down
			case (13): { if (/down/i.test(ev.type)) {
				list.onclick({srcElement: thisNode});
				return false;
		} };
			default: {showSelections(input, input.value, list);} //anything else
		}
	};

	var showSelections =	function(input, typedEntry, list) {
		var visi={showing:[],hiding:[]}, subItems = AJILE.toArray(list.children), firstShown;
	for (var loc = 0; liNode = subItems[loc]; loc++) {
		if (liNode.getElementsByTagName('ul').length > 0) 
		{ subItems.splice.apply(subItems, [loc, 1].concat(AJILE.toArray(liNode.getElementsByTagName('li')))); liNode = subItems[loc]; }

		Class.remove(liNode, 'focused');
		if (!matches(liNode, RegExp.escapeText(typedEntry)))
			{ Class.add(liNode, 'invisi'); visi.hiding.push(liNode.className.match(/loc-(.*?) /)[1]); }
		else 
			{ Class.remove(liNode, 'invisi'); (liNode.className.match(/loc-(.*?) /))?visi.showing.push(liNode.className.match(/loc-(.*?) /)[1]):0; }
		}
	firstShown = (~visi.showing[0].indexOf('-')?visi.showing[0].split('-').reduce(function(a, b) { return +a+(+b); }):visi.showing[0])-1;
		Class.add(subItems[firstShown], 'focused');
		list.className = list.className.replace(/focused-(\d+)/, 'focused-'+0);
		input.hiding = visi.hiding.join(',');
	input.showing = visi.showing.join(',');
	}

	var matches = function(node, inputReg) {
	inputReg = new RegExp('[ -\([]'+inputReg, 'gi');
	if (inputReg.test(' '+node.innerText)) return true; 
	if (inputReg.test(' '+node.className.replace(/par-/, '').replace('focused', '').replace(/loc-.*? /, ''))) return true;
	return false;
	}


};