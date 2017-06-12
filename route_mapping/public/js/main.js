function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
   	center: {lat: 38.83, lng: -77.16}
  });

  // Create an array of alphabetical characters used to label the markers.
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`-=[];:.,/?><+_';

  // Add some markers to the map.
  // Note: The code uses the JavaScript Array.prototype.map() method to
  // create an array of markers based on a given "locations" array.
  // The map() method here has nothing to do with the Google Maps API.
  var markers = starting.map(function(location, i) {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length]
    });
  });

  // Add a marker clusterer to manage the markers.
  var markerCluster = new MarkerClusterer(map, markers,
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'})
}
var starting = [
  {lat: 38.7956, lng: -77.6138},
  {lat: 38.9557, lng: -77.3944},
  {lat: 38.9510, lng: -77.3840},
  {lat: 38.9510, lng: -77.3840},
  {lat: 38.9510, lng: -77.3840},
  {lat: 38.9502, lng: -77.4245},
  {lat: 38.9510, lng: -77.3840},
  {lat: 38.9207, lng: -77.4022},
  {lat: 38.8252, lng: -77.4525},
  {lat: 38.8720, lng: -77.3021},
  {lat: 38.7652, lng: -77.0856},
  {lat: 38.8875, lng: -77.2820},
  {lat: 38.8752, lng: -77.2123},
  {lat: 38.8851, lng: -77.2554},
  {lat: 38.8359, lng: -77.4552},
  {lat: 39.0464, lng: -77.4127},
  {lat: 38.9039, lng: -77.0173},
  {lat: 38.8445, lng: -77.2792},
  {lat: 38.7605, lng: -77.0519},
  {lat: 38.7945, lng: -77.0677},
  {lat: 38.8879, lng: -77.0738},
  {lat: 38.8086, lng: -77.0766},
  {lat: 38.8315, lng: -77.3120},
  {lat: 38.8449, lng: -77.4515},
  {lat: 38.9210, lng: -77.4218},
  {lat: 38.8627, lng: -77.3592},
  {lat: 38.9647, lng: -77.3253},
  {lat: 38.9992, lng: -77.4258},
  {lat: 39.0437, lng: -77.4874},
  {lat: 39.0437, lng: -77.4874},
  {lat: 38.7429, lng: -77.5740},
  {lat: 38.9961, lng: -77.5004},
  {lat: 38.7599, lng: -77.5700},
  {lat: 38.8739, lng: -77.2662},
  {lat: 38.8541, lng: -77.4041},
  {lat: 39.0974, lng: -77.4895},
  {lat: 38.8691, lng: -77.3740},
  {lat: 38.8355, lng: -77.4247},
  {lat: 38.8879, lng: -77.4282},
  {lat: 38.8738, lng: -77.2742},
  {lat: 38.8509, lng: -77.3512},
  {lat: 38.9360, lng: -77.5530}
]
