AJILE.define('dev', function(ui) {
	var exports = {};
	var isDev = AJILE.define('dev.isDev', AJILE.getComponent(AJILE.initialize.initArgs, 'dev'));
	
	if (isDev) ui.Class.add(document.body, 'dev');

	return exports;
} };
