
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  var start = document.getElementById('start');
  var end = document.getElementById('end');

  var autocomplete = new google.maps.places.Autocomplete(start);
  var autocomplete2 = new google.maps.places.Autocomplete(end);
}
