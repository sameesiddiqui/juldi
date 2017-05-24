//make form connect to maps autocomplete
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  var start = document.getElementById('start');
  var end = document.getElementById('end');

  var autocomplete = new google.maps.places.Autocomplete(start);
  var autocomplete2 = new google.maps.places.Autocomplete(end);
}

//smooth scrolling functionality
$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});
