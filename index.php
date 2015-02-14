<?php	    
	//try to find newest gpx file on server
	$gpxFileName;
    if(isset($_GET['date'])) 
    {
      $gpxFileName = './data/' . $_GET['date'] . '.gpx'; 
    } else {
    	$gpxs = glob('./data/*.gpx');
    	$last_modified = 0;
    	if (!is_null($gpxs) && ($gpxs != false)) {
    		foreach ($gpxs as &$gpx) {
    			if (filemtime($gpx) > $last_modified) {
    				$gpxFileName = $gpx;
    				$last_modified = filemtime($gpx);
    			}
    		}
    	} 
    }
?>
<html>
	<head>
		<title>Sledování Kamila :)</title>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
		<link type="text/css" href="./js/theme/default/style.css" rel="stylesheet">
		<link type="text/css" href="./js/theme/default/style.mobile.css" rel="stylesheet">
		<link type="text/css" href="./theme/gpxtrack.css" rel="stylesheet">
		<script src="./js/OpenLayers.js"></script>
		<script src="./js/jquery-2.0.3.js"></script>
		<script type="text/javascript">var gpxFileName = "<?= $gpxFileName ?>";</script>
		<script src="gpxtrack.js"></script>
	</head>
	<body onload="init();">
		<div id="map" class="olMap"></div> 
		<INPUT TYPE="button"
			   NAME="Refresh"
			   VALUE="Refresh"
			   onClick="loadGPX()"/>	   
		<INPUT TYPE="button"
			   NAME="Stop"
			   VALUE="Stop"
			   onClick="stopRefresh()"/>
	</body>
</html>