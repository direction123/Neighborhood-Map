//construct place
var place = function (data) {
  var self = this;
  self.name = data.name;
  self.lat = data.lat;
  self.lng = data.lng;
  this.marker = ko.observable();
};

//init google map
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 34.043911, lng: -118.302605},
    zoom: 13
  });
  ko.applyBindings(new placeListModel());
}

//view model
var placeListModel = function () {
  var self = this;
  //input in the search bar
  self.search_input= ko.observable("");
  //initialize all places
  self.place_list = ko.observableArray([]);
     raw_place_list.forEach(function (place_item) {
       self.place_list.push(new place(place_item));
  });

  //add google map related properties to places
  var marker;
  var infoWindow;
  self.place_list().forEach(function (place_item) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(Number(place_item.lat), Number(place_item.lng)),
      map: map,
      animation: google.maps.Animation.DROP
    });
    //add marker 
    place_item.marker = marker;

    infoWindow = new google.maps.InfoWindow();
    var para = getParameters(place_item.name, place_item.lat, place_item.lng);
    var message = para[0];
    var parameterMap = para[1];
    $.ajax({
      'url': message.action,
      'data': parameterMap,
      'cache': true,
      'dataType': 'jsonp',
      'success': function(data) {
        var content = extactInfo(data);
        //add info window to marker
        google.maps.event.addListener(place_item.marker, 'click', function () {
          infoWindow.open(map, this);
          place_item.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ place_item.marker.setAnimation(null); }, 750);
          infoWindow.setContent(content);
        });
      },
      'error': function (e) {
        document.getElementById("error").innerHTML = "<h4>Yelp data is not availalbe now.</h4>";
      }
    });
      
  });

  //click event when clicking place name
  self.show_info_window = function (place_item) {
    google.maps.event.trigger(place_item.marker, 'click');
  };

  //initialize all visible places
  self.visible_place_list = ko.observableArray([]);
  self.place_list().forEach(function (place_item) {
    self.visible_place_list.push(place_item);
  });
  //filter places with input in the search bar
  self.filter_places = function() {
    //set all visible markers not visible
    self.visible_place_list().forEach(function (place_item) {
      place_item.marker.setVisible(false);
    });
    //remove all visible places
    self.visible_place_list.removeAll();
    //add current visible palces
    var search_input = self.search_input().toLowerCase();
    self.place_list().forEach(function (place_item) {
      if (place_item.name.toLowerCase().indexOf(search_input) !== -1) { 
        self.visible_place_list.push(place_item);
      }
    });
    self.visible_place_list().forEach(function (place_item) {
      place_item.marker.setVisible(true);
    });
  };

  //mobile menu
  self.show_place_list = function() {
    $('.place-list').toggle();
  }
};
 