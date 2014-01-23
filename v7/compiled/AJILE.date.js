AJILE.date = {initialize: function() {
		// All Ele's use id -> tagName so shortcall this
	var getEl = function(id, tag) { return document.getElementById(id).getElementsByTagName(tag)[0]; };
	
	AJILE.require('ui');
	AJILE.require('event');
	
	var UIElements = {
		diffCount: (function() {
			var exports = {value: null},
				display = exports.display = getEl('dateCount', 'span'), 
				input = exports.input = getEl('dateCount', 'input'),
				value = exports.value = AJILE.provide('date.UIElements.diffCount.value', 31);

			display.onclick = function() { 
			  AJILE.ui.Class.remove(input, 'hide');
			  AJILE.ui.Class.add(display, 'hide');
			  input.focus();
			  input.select();
			};
			AJILE.bind(input, 'blur', function() { 
			  display.innerText = exports.value = (+input.value  !== null)? +input.value : 30; 
			  AJILE.ui.Class.remove(display, 'hide');
			  AJILE.ui.Class.add(input, 'hide');
			  AJILE.event.publish('dateMod');
			});
			AJILE.bind(input, 'keydown', function(ev) { 
				switch ((ev||window.event).keyCode) {
					case 13: { input.blur(); break; }
					case 9:  { 
						UIElements.diffInterval.display.onclick(); 
						input.blur(); 
						(ev||window.event).preventDefault?(ev||window.event).preventDefault():(ev||window.event).returnValue = false;
						break; 
					}
				}
			});

			display.innerText = input.value = value;
			return exports;
		})(),
		
		diffInterval: (function() {
			var exports = {value: null},
				display = exports.display = getEl('diffInterval', 'span'), 
				input = exports.input = getEl('diffInterval', 'select'),
				value = exports.value = AJILE.provide('date.UIElements.diffInterval.value', 0);
			
			display.onclick = function() { 
			  AJILE.ui.Class.remove(input, 'hide');
			  AJILE.ui.Class.add(display, 'hide');
			  input.focus();
			};
			AJILE.bind(input, 'blur', function() { 
			  display.innerText = exports.value = input.options[input.selectedIndex].innerText; 
			  AJILE.ui.Class.remove(display, 'hide');
			  AJILE.ui.Class.add(input, 'hide');
			  AJILE.event.publish('dateMod');
			});
			AJILE.bind(input, 'keydown', function(ev) { 
				switch ((ev||window.event).keyCode) {
					case 13: { input.blur(); break; }
					case 9:  { 
						UIElements.currDate.display.onclick(); 
						input.blur(); 
						(ev||window.event).preventDefault?(ev||window.event).preventDefault():(ev||window.event).returnValue = false;
						break; 
					}
				}
			});
			
			display.innerText = exports.value = input.options[value].innerText;
			return exports;
		})(),
		
		currDate: (function() { 
			var exports = {value: null},
			  display = exports.display = getEl('currDate', 'span'), 
			  input = exports.input = getEl('currDate', 'input'),
				value = exports.value = AJILE.provide('date.UIElements.currDate.value', formatDate(new Date()));

			display.onclick = function() { 
			  AJILE.ui.Class.remove(input, 'hide');
			  AJILE.ui.Class.add(display, 'hide');
			  input.focus();
			};
			AJILE.bind(input, 'blur', function() { 
			  if (/today/i.test(input.value)) input.value = formatDate(new Date());
			  display.innerText = exports.value = formatDate(new Date(input.value)) || formatDate(new Date()); 
			  AJILE.ui.Class.remove(display, 'hide');
			  AJILE.ui.Class.add(input, 'hide');
			  AJILE.event.publish('dateMod');
			});
			AJILE.bind(input, 'keydown', function(ev) { 
				switch ((ev||window.event).keyCode) {
					case 13: { input.blur(); break; }
					case 9:  { 
						input.blur(); 
						(ev||window.event).preventDefault?(ev||window.event).preventDefault():(ev||window.event).returnValue = false;
						break; 
					}
				}
			});

			display.innerText = input.value = formatDate(value);
			return exports;
		})()
	};
	
	AJILE.event.subscribe('dateMod', function() {
	  var newDate = new Date(UIElements.currDate.value), length = /day/.test(UIElements.diffInterval.value) ? 'Date' : (/month/.test(UIElements.diffInterval.value) ? 'Month' : 'Year');
	  newDate['set' + length](UIElements.diffCount.value + newDate['get'+length]());
    document.getElementById('calcDate').innerText = formatDate(newDate);
	});
	
	function formatDate(today) { 
		if (!/date/i.test(today.constructor)) today = new Date(today);
		return today.getMonth()+1 + '/' + today.getDate() + '/' + (+today.getFullYear()); 
	}

	AJILE.event.publish('dateMod');

} };