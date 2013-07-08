<?php
	header('Content-Type: application/javascript');
	$files = glob('[!_]*.js');
	$js = file_get_contents('_prototypes.js') ."\n". file_get_contents('_AJILE.js')."\n";
	foreach($files as $file) { $js .= "\n".file_get_contents($file); }
	echo $js;
?>