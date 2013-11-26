var skin = require('mongoskin');
var request = require('request');
var monot = require("monot")
var url = require('url');
var db = skin.db('localhost:27017/akuisisi', { safe : true}); 
var Date = monot()

var root = "http://167.205.81.172:8080/geoserver/msop/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=6000&outputFormat=json&typeName=msop:";
var types = [
  'hotel', 
  'purbakala', 
  'kultural', 
  'kontemporer', 
  'bandara_sipil', 
  'museum', 
  'objek_alam', 
  'pantai', 
  'pelabuhan',
  'restaurant',
  'terminal'
]

var count = 0

var mapped = {
  'nm_bang' : 'title',
  'nam_obj' : 'title',
  'namobj' : 'title',
  'nampel' : 'title',
  'keterangan' : 'description',
  'alamat' : 'address'
}

function get(type){
  return root + type;
}

for (var j = 0; j < types.length; j++) {

request(get(types[j]), function(a, b, c){

  if (a) return;

  var parsed = url.parse(b.req.path, true)
  var arr = parsed.query.typeName.split(":")
  var currentType = arr[arr.length - 1];

  var collection = JSON.parse(c);

  var features = collection.features;

  for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    var copied = features[i];

    for (var k in feature.properties) {
      var mappedKeys = Object.keys(mapped);

      if (mappedKeys.indexOf(k) > -1) {
        copied.properties[ mapped[k] ] = feature.properties[k] ? feature.properties[k].trim() : "";
      }

      copied.properties.categories = [ currentType ]
      copied.id = Date.now();

      if (copied.geometry)
      db.collection('features').update({ "geometry.coordinates" : copied.geometry.coordinates[0]}, copied, {upsert : true}, function(err, result) {
        if (err) throw err;
        if (result) {
          console.log(count);
        }
      })
    }
  }

})}