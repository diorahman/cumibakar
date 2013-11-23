angular.module('buncisApp.controllers', []).value('version', '0.1');

var cloudmadeApiKey = 'bd4dd9dd62ca4e57be048f0cd5ff82fa'
var cloudmadeTileUrl = 'http://{s}.tile.cloudmade.com/' + cloudmadeApiKey + '/997/256/{z}/{x}/{y}.png'
var cloudmadeAttr = 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a><br>Imagery &copy <a href="http://cloudmade.com/">CloudMade</a>.'
var interval = 200;

var mapOptions = { zoomControl : false, zoom : 16 };
var tileOptions = { attribution : cloudmadeAttr, maxZoom : 18 };
var markerOptions = { draggable : true }

function MainController($scope, $http, $timeout, basicAuth){

  $scope.features = []
  $scope.success = false;

  function load(){
    $http.get('/features')
    .success(function(data, status){
      $scope.features = data;
      $scope.success = true;

      $timeout(function(){
        $scope.success = false;
      }, 1500)
    })
    .error(function(data, status){ console.log("TODO: error")
  })
  }

  $timeout(load, 500);
}

function ImageController($scope, $http, $timeout, $routeParams, basicAuth){
  
  $scope.image = {
    featureId :  $routeParams.id,
    filename : $routeParams.filename
  }

  $scope.saveLabel = "Save"

  $scope.save = function(){
    $scope.saving = true
    $scope.saveLabel = "Saving..."
    $http.post("/image-meta/" + $routeParams.filename, $scope.image)
    .success(function(data, status){
      $scope.saving = false
      $scope.saveLabel = "Save"
      $scope.success = true

      $timeout(function(){
        $scope.success = false;
      }, 1500)
    })
    .error(function(data, status){
      $scope.saving = false
      $scope.saveLabel = "Save"

      $scope.failed = true;

      $timeout(function(){
        $scope.failed = false;
      }, 1500)
    })
  }

  $scope.del = function(){
    $scope.saving = true
    $http.post("/image-del/" + $routeParams.filename)
    .success(function(data, status){
      $scope.image.deleted = true; 
      $scope.saving = false
      $scope.success = true

      $timeout(function(){
        $scope.success = false;
      }, 1500)
    })
    .error(function(data, status){
      $scope.image.deleted = false; 
      $scope.saving = false
      
      $scope.failed = true;

      $timeout(function(){
        $scope.failed = false;
      }, 1500)

    })
  }

  $scope.recover = function(){
    $scope.saving = true
    $http.post("/image-rec/" + $routeParams.filename)
    .success(function(data, status){
      $scope.image.deleted = false; 
      $scope.saving = false
      $scope.success = true

      $timeout(function(){
        $scope.success = false;
      }, 1500)
    })
    .error(function(data, status){
      $scope.image.deleted = true; 
      $scope.saving = false
      $scope.success = false
      $scope.failed = true;

      $timeout(function(){
        $scope.failed = false;
      }, 1500)

    })
  }

  $scope.close = function(){
    $scope.success = false;
    $scope.failed = false;
  }

  function load(){

    $http.get("/image-meta/" + $routeParams.filename)
    .success(function(data, status){



      for(var key in data.metadata) {
        $scope.image[key] = data.metadata[key]
      }
    })
    .error(function(data, status){
      console.log("TODO: error")
    })
  }

  $timeout(load, 250);

  var img = $("<img>").attr("src", "/image/" + $routeParams.filename)
  $("#image-main").append(img);
}

function EditController($scope, $http, $timeout, $routeParams, basicAuth){

  var map, marker, tileLayer;

  $scope.feature = {}
  $scope.saveLabel = "Save"
  $scope.lat = -1
  $scope.lng = -1

  $scope.$watch('lat', function(val) {
    if($scope.feature.geometry) {
      $scope.feature.geometry.coordinates[1] = val;  
      marker.setLatLng([$scope.feature.geometry.coordinates[1], $scope.feature.geometry.coordinates[0]]);
      map.panTo([$scope.feature.geometry.coordinates[1], $scope.feature.geometry.coordinates[0]]);
    }
  })

  $scope.$watch('lng', function(val) {
    if($scope.feature.geometry) {
      $scope.feature.geometry.coordinates[0] = val;  
      marker.setLatLng([$scope.feature.geometry.coordinates[1], $scope.feature.geometry.coordinates[0]]);
      map.panTo([$scope.feature.geometry.coordinates[1], $scope.feature.geometry.coordinates[0]]);
    }
  })

  var map, marker, tileLayer, coords, lnglat;

  function render(feature){

    $scope.lat = $scope.feature.geometry.coordinates[1];
    $scope.lng = $scope.feature.geometry.coordinates[0];

    coords = [$scope.feature.geometry.coordinates[1], $scope.feature.geometry.coordinates[0]];

    map = map || L.map('map', mapOptions);
    marker =  marker || L.marker(coords, markerOptions).addTo(map).bindPopup("Titik Akuisisi");
    tileLayer = tileLayer || L.tileLayer(cloudmadeTileUrl, tileOptions).addTo(map);

    marker.on('dragend', function(e){
      var c = e.target._latlng;
    
      $scope.feature.geometry.coordinates[1] = e.target._latlng.lat
      $scope.feature.geometry.coordinates[0] = e.target._latlng.lng

      $timeout(function(){
        $scope.lat = e.target._latlng.lat
        $scope.lng = e.target._latlng.lng  
      }, 100)
      
    })

    // map set view to given options
    map.setView(coords, mapOptions.zoom);
    marker.setLatLng(coords);
    marker.update();
  }

  $scope.save = function(){
    $scope.saving = true;
    $scope.saveLabel = "Saving..."

    $scope.feature.geometry.coordinates[1] = $scope.lat
    $scope.feature.geometry.coordinates[0] = $scope.lng

    $http.post("/features/" + $scope.feature.id, $scope.feature)
    .success(function(data, status){

      $scope.saveLabel = "Save"
      $scope.saving = false;
      $scope.success = true;

      $timeout(function(){
        $scope.success = false;
      }, 1500)

    })
    .error(function(){
      $scope.failed = true;

      $scope.saveLabel = "Save"

      $timeout(function(){
        $scope.failed = false;
      }, 1500)

    })
  }

  $scope.close = function(){
    $scope.success = false;
    $scope.failed = false;
  }

  function load(){

    $http.get('/features/' + $routeParams.id)
    .success(function(data, status){
      $scope.feature = data;
      render(data);
    })
    .error(function(data, status){
      console.log("TODO: error");
    })


    $http.get('/images/' + $routeParams.id)
    .success(function(data, status){
      $scope.images = data;
    })
    .error(function(data, status){
      console.log("TODO: error"); 
    })
  }

  $timeout(load, 100);
  
}