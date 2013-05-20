google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {

  google_event_listen_searchbox();
  
}

function google_event_listen_searchbox() {

   // Initialized map center
  var mapOptions = {
      center: new google.maps.LatLng(37.775, -122.419),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // Input from search bar
  var input = document.getElementById('target');
  
  // Initial map object
  var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
  
  // An array to store all marker objects on a map
  var markersArray = [];

  // Initialising searchbox object
  var searchBox = new google.maps.places.SearchBox(input);

  // Event listener for any input in searchbox
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    
    // get the object of the place that is searched
    var places = searchBox.getPlaces();

    // Lat and Lng of the dropped marker
    searchedlat = floorFigure(places[0].geometry.location.jb, 3);
    searchedlng = floorFigure(places[0].geometry.location.kb, 3);

    // Initialise new map options and center of new map upon marker drop or search query
    var newmapOptions = {

      center : new google.maps.LatLng(searchedlat,searchedlng),
      zoom:14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    
    }

    // Initialise a new map object to replace the initial map object
    var newmap = new google.maps.Map(document.getElementById("map-canvas"), newmapOptions);


    marker = new google.maps.Marker({
      map: newmap,
      draggable:true,
      icon : new google.maps.MarkerImage("../img/black.png", null, null, new google.maps.Point(10,10)),
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(searchedlat,searchedlng),
    });

    // Clears the previous marker and shifts the current marker to the first index
    markersArray.shift(marker);

    // Clears all previous displayed information 
    $('#infobox').html("");

    // Event listener for the idle event after search query and marker drop.
    google.maps.event.addListener(marker, 'idle', begin_ajax_call(marker));

  //end of searchBox event listener  
  });

  

}

/**
* This function makes ajax calls to social media and handles its response
*/
function begin_ajax_call(marker, searchedlat, searchedlng) {
    //dragend event executes after the marker is dropped and released
     
      lat = floorFigure(marker.getPosition().lat(), 3); //converting lat to 3 decimal places
      lng = floorFigure(marker.getPosition().lng(), 3); //converring lng to 3 decimal places

      // Debugging statements
      console.log(lat);
      console.log(lng);

      // Ajax call to get the location object of the queried lat and lng
      $.ajax({
        type : "GET",
        url: 'https://api.instagram.com/v1/locations/search?lat=' + lat + '&lng=' + lng + '&access_token=31376751.1fb234f.6b202a4372be40be85a6caeda9096adc&callback=?',
        data : '',
        dataType : 'jsonp',
        success: function( location_response ) {

          robject1 = location_response;
          
          $('#myModal').modal('toggle');
          //console.log("success 1!");

          // Loop through the response object of the location to obtain all pictures and information in the locality
          for (counter = 0; counter <= robject1.data.length; counter++) {
            locationid1 = robject1.data[counter].id;
            
            $.ajax({
              
              type : "GET",
              url: 'https://api.instagram.com/v1/locations/' + locationid1 + '/media/recent?access_token=31376751.1fb234f.6b202a4372be40be85a6caeda9096adc&callback=?',
              data: '',
              dataType : 'jsonp',
              success: function( response ) {
                robject2 = response;

                console.log(robject2);

                render_data(robject2);
                
                //close infowindow to refresh DOM ondrag again to a new position
                google.maps.event.addListener(marker, 'dragend', function() { 
                //MyInfoWindow.close(); 
                 $("#infobox").html("");

                begin_ajax_call(marker);
                //end of dragend event listener
                });
              } 
            //end of ajax calls
            });
          //end of for loop
          }
        //end of first ajax call success event 
        }
      //end of first ajax call  
      });

//end of function
}  


/**
* This function returns a float number that is of the specified decimal places
*
*/
function floorFigure(figure, decimals){
    if (!decimals) decimals = 2;
    var d = Math.pow(10,decimals);
    return (parseInt(figure*d)/d).toFixed(decimals);
};

/**
* This function renders the popover and data returned by the ajax calls
*
*/
function render_data(robject2) { 
  for (i = 0; i < robject2.data.length; i++) {

    popover_content = '<b>Location: </b><br />' + robject2.data[i].location.name + '<br /><b>Comment: </b><br />' + robject2.data[i].comments.data[0].text  + '<br /><b>Likes: </b><br />' + robject2.data[i].likes.count + '<br /><b>Picture: </b><br /><img src=' + robject2.data[i].images.low_resolution.url + '>';

    infobox_data = '<a href=' + robject2.data[i].images.standard_resolution.url + '><div id=infobox_data_' + robject2.data[i].id + ' data-trigger="hover" data-toggle="infobox_data_' + robject2.data[i].id + '" data-content="' + popover_content + '" data-placement="top"><img src=' + robject2.data[i].images.thumbnail.url + '></div></a>';
    
    $('#infobox').append(infobox_data)

    $('#infobox_data_' + robject2.data[i].id).popover({html:true});

  }

}

