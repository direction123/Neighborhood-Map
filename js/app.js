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

function googleMapError() {
  document.getElementById('error').innerHTML = "<h2>Google Maps is not loading.</h2>";
}

//view model
var placeListModel = function () {
  var self = this;
  //input in the search bar
  self.searchInput= ko.observable("");
  //initialize all places
  self.placeList = ko.observableArray([]);
     rawPlaceList.forEach(function (placeItem) {
       self.placeList.push(new place(placeItem));
  });

  //add google map related properties to places
  var marker;
  var infoWindow;
  self.placeList().forEach(function (placeItem) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(Number(placeItem.lat), Number(placeItem.lng)),
      map: map,
      animation: google.maps.Animation.DROP
    });
    //add marker 
    placeItem.marker = marker;

    infoWindow = new google.maps.InfoWindow();
    var para = getParameters(placeItem.name, placeItem.lat, placeItem.lng);
    var message = para[0];
    var parameterMap = para[1];
    $.ajax({
       url: message.action,
       data: parameterMap,
       cache: true,
       dataType: 'jsonp',
       timeout : 1000, //handle jsonp error
       success: function(data) {
        var content = extactInfo(data);
        //add info window to marker
        google.maps.event.addListener(placeItem.marker, 'click', function () {
          infoWindow.open(map, this);
          placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ placeItem.marker.setAnimation(null); }, 700);
          infoWindow.setContent(content);
        });
      },
       error: function (e) {
        google.maps.event.addListener(placeItem.marker, 'click', function () {
          infoWindow.open(map, this);
          placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){ placeItem.marker.setAnimation(null); }, 750);
          infoWindow.setContent("<h5>Yelp data is not availalbe now.</h5>");
        });
      }
    });
      
  });

  //click event when clicking place name
  self.showInfoWindow = function (placeItem) {
    google.maps.event.trigger(placeItem.marker, 'click');
  };

  //initialize all visible places
  self.visiblePlaceList = ko.observableArray([]);
  self.placeList().forEach(function (placeItem) {
    self.visiblePlaceList.push(placeItem);
  });
  //filter places with input in the search bar
  self.filterPlaces = function() {
    //set all visible markers not visible
    self.visiblePlaceList().forEach(function (placeItem) {
      placeItem.marker.setVisible(false);
    });
    //remove all visible places
    self.visiblePlaceList.removeAll();
    //add current visible palces
    var searchInput = self.searchInput().toLowerCase();
    self.placeList().forEach(function (placeItem) {
      if (placeItem.name.toLowerCase().indexOf(searchInput) !== -1) { 
        self.visiblePlaceList.push(placeItem);
      }
    });
    self.visiblePlaceList().forEach(function (placeItem) {
      placeItem.marker.setVisible(true);
    });
  };

  //mobile menu
  self.showPlaceList = function() {
    $('.place-list').toggle();
  }
};
 