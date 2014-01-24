AJILE.define('dev', ['ui'], function(ui) {
	var exports = {};
	var isDev = exports.isDev = AJILE.define('dev.isDev', /dev/i.test(AJILE.require('initArgs')));
	
	if (isDev) ui.Class.add(document.body, 'dev');

	return exports;
} );
