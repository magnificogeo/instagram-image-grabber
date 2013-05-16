function initialize() {

  var mapOptions = {
      center: new google.maps.LatLng(37.775, -122.419),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);


  marker = new google.maps.Marker({
    map:map,
    draggable:true,
    icon : new google.maps.MarkerImage("../img/black.png", null, null, new google.maps.Point(10,10)),
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(37.775,-122.419)
  });

  //dragend event executes after the marker is dropped and released
  google.maps.event.addListener(marker, 'dragend', function() {
    
    //console.log(marker.getPosition());
    lat = floorFigure(marker.getPosition().kb, 3); //converting lat to 3 decimal places
    lng = floorFigure(marker.getPosition().lb, 3); //converring lng to 3 decimal places
    console.log(lat);
    console.log(lng);
    $.ajax({
      type : "GET",
      url: 'https://api.instagram.com/v1/locations/search?lat=' + lat + '&lng=' + lng + '&client_id=ac76e215f903414195a35024c7290296&callback=?',
      data : '',
      dataType : 'jsonp',
      success: function( location_response ) {

        robject1 = location_response;
        
        $('#myModal').modal('toggle');
        //console.log("success 1!");

        for (counter = 0; counter <= robject1.data.length; counter++) {
          locationid1 = robject1.data[counter].id;
          $.ajax({
            type : "GET",
            url: 'https://api.instagram.com/v1/locations/' + locationid1 + '/media/recent?client_id=ac76e215f903414195a35024c7290296&callback=?',
            data: '',
            dataType : 'jsonp',
            success: function( response ) {

            robject2 = response;

            //console.log("success 2!");
     
            /*
            var MyInfoWindow = new google.maps.InfoWindow({ 
              content: get_marker_content()
            });

            MyInfoWindow.open(map, marker); 
            */
            console.log(robject2);

            render_data(robject2);
            
            //close infowindow to refresh DOM ondrag again to a new position
             google.maps.event.addListener(marker, 'dragend', function() { 
            //MyInfoWindow.close(); 
              $('#infobox').html("");
            } );
            

            }
          });
        }
        
      }
    });
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

function floorFigure(figure, decimals){
    if (!decimals) decimals = 2;
    var d = Math.pow(10,decimals);
    return (parseInt(figure*d)/d).toFixed(decimals);
};

function get_marker_content() {

  return "<div id='rtinfo' style='overflow : none; height : 300px; width : 600px; font-family:Open Sans, sans serif'><h3> What's going on around here? </h3>";

}

function render_data(robject2) { 
  for (i = 0; i < robject2.data.length; i++) {

    $('#infobox').append('<img src=' + robject2.data[i].images.thumbnail.url + '>');

  } 
}



