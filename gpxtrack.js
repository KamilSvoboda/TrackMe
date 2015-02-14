// Start position for the map 
var initLat=50.352553;
var initLon=15.907484;
var initZoom=16;

var map; //complex object of type OpenLayers.Map
var intervalID;

var template = {
    strokeColor: "#0000FF",
    strokeOpacity: 1,
    strokeWidth: 3,
    fillColor: "#00AAFF",
    fillOpacity: 1,
    pointRadius: 5,
    pointerEvents: "visiblePainted",

    externalGraphic: "./img/arrow.png", //externalGraphic url from attribute url use "${url}"
    graphicXOffset :  -(40/2),
    graphicYOffset :  -(40/2),
    graphicWidth   : 40,
    graphicHeight  : 40,
    rotation:0,
    //label : "${name}", //label from attribute name
    label : "",

    labelXOffset:  0,
    labelYOffset: -5,
    fontColor: "red",
    fontSize: "24px",
    fontFamily: "Arial",
    fontWeight: "bold",
    labelAlign: "lt"
}; 
var aStyleMap = new OpenLayers.StyleMap(new OpenLayers.Style(template));

function init() {	
	mapInit();		
	
	//get gpx file name from URL parameter named "gpxFile"	
	var gpxFileNameFromUrl = gup("gpxFile");
	if (gpxFileNameFromUrl != null && gpxFileNameFromUrl.length > 0)
	{
		gpxFileName = gpxFileNameFromUrl;
		refreshMap(5);
	} else 
	{		
		//try to load file from server automaticaly	(PHP is processed on the server first)
		if (gpxFileName != null && gpxFileName.length > 0){
			refreshMap(5);
		} else 
		{
			alert("no GPX file on server");
			stopRefresh();
		}
	}
}

//základní inicializace mapy
function mapInit()
{
	console.log("Map initialization");
			
	// create a new class for Open.Mapquest tiles
	OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
	name: "MapQuestOSM",
	//attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
	sphericalMercator: true,
	url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
	clone: function(obj) {
		if (obj == null) {
			obj = new OpenLayers.Layer.OSM(
			this.name, this.url, this.getOptions());
		}
		obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
		return obj;
	},
	CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
	});
	var mapquestosm = new OpenLayers.Layer.MapQuestOSM();
	
	var openCycle = new OpenLayers.Layer.OSM("OpenCycleMap",
		  ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
		   "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
		   "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]);
	   
	var simpleOsm = new OpenLayers.Layer.OSM("Simple OSM Map");		

	map = new OpenLayers.Map('map');
	map.addLayers([mapquestosm, openCycle, simpleOsm]);
	map.addControl(new OpenLayers.Control.LayerSwitcher());

	map.setCenter(new OpenLayers.LonLat(initLon, initLat).transform(
					new OpenLayers.Projection("EPSG:4326"),
					map.getProjectionObject()), initZoom);
	
	console.log("Map initialization - finished");
}

//načtení GPX do mapy
function loadGPX()
{
	var jqxhr = $.ajax( gpxFileName )
		.done(function(xml) { 
			//alert("gpx " + gpxFileName +" loaded");
			console.log("gpx " + gpxFileName +" loaded");
			var last = $(xml).find('trkpt').last();
			var lat = $(last).attr('lat');
			var lon = $(last).attr('lon');						
			var lastLonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			//load last time to the symbol
			var time = $(last).find('time').text();
            template.label = time.split('T')[1];
            //load course of movings
            var courseObj = $(last).find('course');	
            if(courseObj.length){                     
                template.rotation = parseInt(courseObj.text()) - 45; 
            }
            
			console.log('Last trackpoint: ' + lat + ', ' + lon + ', ' + time + ', ' + template.rotation +'°');			

			var gpxLayer = map.getLayer(gpxFileName);
			if (gpxLayer != null) {
				//map.removeLayer(gpxLayer);
				//gpxLayer.destroy();
				gpxLayer.refresh();
			} else {				 
				// Add the Layer with the GPX Track				
				gpxLayer = new OpenLayers.Layer.Vector("Track " + time.split('T')[0], { 
					protocol: new OpenLayers.Protocol.HTTP({ 
						url: gpxFileName, 
						format: new OpenLayers.Format.GPX
					}), 
					strategies: [new OpenLayers.Strategy.Fixed()], 
					visibility: true,  
					style: {strokeColor: "blue", strokeWidth: 5, strokeOpacity: 0.5},					
					projection: new OpenLayers.Projection("EPSG:4326") 
				}); 				
				gpxLayer.id = gpxFileName;				
				map.addLayer(gpxLayer);
			}
			
			/*			
			// Add last position marker
			var markers = map.getLayer("lastPosition");
			if (markers != null) {
				markers.clearMarkers();
			} else {
				markers = new OpenLayers.Layer.Markers( "Last position" );
				markers.id = "lastPosition";
				map.addLayer(markers);				
			}								
			var size = new OpenLayers.Size(21,25);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
			markers.addMarker(new OpenLayers.Marker(lastLonLat,icon));				
			*/
					
						
			var markers = map.getLayer("lastPosition");
			if (markers != null)
			{
				markers.removeAllFeatures();
			} else {
				markers = new OpenLayers.Layer.Vector("Markers", {
                    styleMap: aStyleMap,
                    visibility: true,  
                    projection: new OpenLayers.Projection("EPSG:4326") 
                    });
                markers.id = "lastPosition";
                map.addLayer(markers);
			}

			// create a point feature			
			var point = new OpenLayers.Geometry.Point(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			var pointFeature = new OpenLayers.Feature.Vector(point,null,null);			
			markers.addFeatures([pointFeature]); 
							
			map.setCenter(lastLonLat);

		})
		.fail(function() { 
		    alert("Error while loading " + gpxFileName); 
		    stopRefresh(); 
		    })
		//.always(function() { alert("complete"); })
		;	
}

//sets new interval
function refreshMap (interval) 
{	
	stopRefresh();
	loadGPX();
	intervalID = setInterval(loadGPX,  interval * 1000);		
}

//stops refresh
function stopRefresh() 
{
	clearInterval(intervalID);
}

//vrátí hodnotu parametru určitého jména
function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
	return "";
  else
	return results[1];
}