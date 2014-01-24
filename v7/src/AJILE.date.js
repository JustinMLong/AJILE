AJILE.define('date', function(ui, event) {
		// All Ele's use id -> tagName so shortcall this
	var getEl = function(id, tag) { return document.getElementById(id).getElementsByTagName(tag)[0]; };
	
	if (!(document.getElementById('dateCount') || document.getElementById('diffInterval') || document.getElementById('currDate')))
		throw "Date Calculator not implemented correctly, check your implementation and reload the module";
	
	var UIElements = {
		diffCount: (function() {
			var exports = {value: null},
				display = exports.display = getEl('dateCount', 'span'), 
				input = exports.input = getEl('dateCount', 'input'),
				value = exports.value = AJILE.provide('date.UIElements.diffCount.value', 31);

			display.onclick = function() { 
			  ui.Class.remove(input, 'hide');
			  ui.Class.add(display, 'hide');
			  input.focus();
			  input.select();
			};
			AJILE.bind(input, 'blur', function() { 
			  display.innerText = exports.value = (+input.value  !== null)? +input.value : 30; 
			  ui.Class.remove(display, 'hide');
			  ui.Class.add(input, 'hide');
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
			  ui.Class.remove(input, 'hide');
			  ui.Class.add(display, 'hide');
			  input.focus();
			};
			AJILE.bind(input, 'blur', function() { 
			  display.innerText = exports.value = input.options[input.selectedIndex].innerText; 
			  ui.Class.remove(display, 'hide');
			  ui.Class.add(input, 'hide');
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
			  ui.Class.remove(input, 'hide');
			  ui.Class.add(display, 'hide');
			  input.focus();
			};
			AJILE.bind(input, 'blur', function() { 
			  if (/today/i.test(input.value)) input.value = formatDate(new Date());
			  display.innerText = exports.value = formatDate(new Date(input.value)) || formatDate(new Date()); 
			  ui.Class.remove(display, 'hide');
			  ui.Class.add(input, 'hide');
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
	
	event.subscribe('dateMod', function() {
		var newDate = new Date(UIElements.currDate.value), length = /day/.test(UIElements.diffInterval.value) ? 'Date' : (/month/.test(UIElements.diffInterval.value) ? 'Month' : 'Year');
		newDate['set' + length](UIElements.diffCount.value + newDate['get'+length]());
		document.getElementById('calcDate').innerText = formatDate(newDate);
	});
	
	function formatDate(today) { 
		if (!/date/i.test(today.constructor)) today = new Date(today);
		return today.getMonth()+1 + '/' + today.getDate() + '/' + (+today.getFullYear()); 
	}

	event.publish('dateMod');

});