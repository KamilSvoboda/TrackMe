<?php
	echo '<?xml version="1.0" encoding="UTF-8"?><result><message>';

	$res_msg = 'something went wrong :)';

	$gpxFileName = "./data/".date('Y-m-d') . ".gpx";
	
	$lat = $_GET["lat"];
	$lon = $_GET["lon"];
	$alt = $_GET["alt"];
	$speed = $_GET["speed"];
	$bearing = $_GET["bearing"];	
	$time = $_GET["time"];


	//echo 'Zapis do: ' . $gpxFileName . ', lat:' . $lat . ',lon: ' . $lon . ', time: ' . $time;				
	
	if ((!is_null($lat)) && (!is_null($lon)) && (!is_null($time))) {		
		//append new points to existing file
		if (file_exists($gpxFileName))
		{
			$dom = new DOMDocument(); 

			if ($dom->load($gpxFileName))
			{
				$trackSeqs = $dom->getElementsByTagName('trkseg');	
				if (!is_null($trackSeqs) && $trackSeqs->length > 0) 
				{
					$lastTrkseq = $trackSeqs->item(($trackSeqs->length - 1));						
					$lastTrkseq->appendChild(getTrackPoint($dom,$lat,$lon,$alt,$speed,$bearing,$time));
					if ($dom->save($gpxFileName) > 0)
					{			
						$res_msg = "new track point saved";
					}
				}
			}
		} else //create new file
		{ 
			$dom = new DOMDocument("1.0","UTF-8");		
			$dom->preservWhiteSpace = false; 
			$dom->formatOutput = false; 
			
			$gpx = $dom->createElement("gpx");
			$gpx->setAttribute("xmlns","http://www.topografix.com/GPX/1/1");
			$gpx->setAttribute("version","1.1");
			$gpx->setAttribute("creator","svoboda.biz");
			$trk = $dom->createElement("trk");
			$trkseq = $dom->createElement("trkseg");

			$trkseq->appendChild(getTrackPoint($dom,$lat,$lon,$alt,$speed,$bearing,$time));
			$trk->appendChild($trkseq);
			$gpx->appendChild($trk);
			$dom->appendChild($gpx);
			if ($dom->save($gpxFileName) > 0) 
			{
				$res_msg = "new GPX file created";
			}			
		}
	} else 
	{
		$res_msg = "missing some parameters";
	}
	
	echo $res_msg.'</message></result>';
	
	//get trackpoint element from request parameters
	function getTrackPoint(&$dom,&$lat,&$lon,&$alt,&$speed,&$bearing,&$time) {
		$newTrackPoint = $dom->createElement("trkpt");
		$newTrackPoint->setAttribute("lat",$lat);
		$newTrackPoint->setAttribute("lon",$lon);		
		$trackPointTime = $dom->createElement("ele",$alt);
		$trackPointTime = $dom->createElement("speed",$speed);
		$trackPointTime = $dom->createElement("course",$bearing);
		$trackPointTime = $dom->createElement("time",$time);
		$newTrackPoint->appendChild($trackPointTime);
		return $newTrackPoint;
	}	
?>