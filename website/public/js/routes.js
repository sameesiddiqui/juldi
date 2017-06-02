function initMap() {
  var start = document.getElementById('start-loc');
  var end = document.getElementById('end-loc');

  var autocomplete = new google.maps.places.Autocomplete(start);
  var autocomplete2 = new google.maps.places.Autocomplete(end);

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: {lat: 38.83, lng: -77.16}
  });
  directionsDisplay.setMap(map);

    calculateAndDisplayRoute(directionsService, directionsDisplay);

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: "Burke Centre Amtrak Station",
    destination: "Farragut North Station",
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
