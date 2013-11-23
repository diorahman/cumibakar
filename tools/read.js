var fs = require("fs")
var skin = require('mongoskin');
var db = skin.db('localhost:27017/akuisisi', { safe : true}); 

//var root = __dirname + "/../data/Cumi/data";
var root = __dirname + "/../data/akuisisi";
var features = fs.readdirSync(root)
var count = 1;
var maxCount = 0;

function readFeature(feature){
  fs.readFile(feature, function (err, data) {
    if (err) throw err;
    var raw = JSON.parse(data);

    var obj = {
      type : "Feature",
      geometry : {
        type : "Point",
        coordinates : []
      },
      properties : {}
    }

    var lon = raw.properties.initialCoords ? raw.properties.initialCoords.longitude : raw.geometry.coordinates[1]
    var lat = raw.properties.initialCoords ? raw.properties.initialCoords.latitude : raw.geometry.coordinates[0]

    obj.geometry.coordinates = [lon, lat]
    obj.id = raw.properties.id
    obj.properties.accuracy = raw.properties.initialCoords ? raw.properties.initialCoords.accuracy : null
    obj.properties.altitude = raw.properties.initialCoords ? raw.properties.initialCoords.altitude : null
    obj.properties.timestamp = raw.properties.initialTimestamp;

    // metas
    obj.properties.title = raw.properties.title
    obj.properties.subtitle = raw.properties.subtitle
    obj.properties.description = ((raw.properties.description1 || "") + " " + (raw.properties.description2 || "") + " " + (raw.properties.description3 || "")).trim()
    obj.properties.address = ((raw.properties.address1 || "") + " " + (raw.properties.address2 || "") + " " + (raw.properties.address3 || "")).trim()
    obj.properties.note = ((raw.properties.note1 || "") + " " + (raw.properties.note2 || "") + " " + (raw.properties.note3 || "") + " " + (raw.properties.note4 || "") + " " + (raw.properties.note5 || "")).trim();

    db.collection('features').update({ "geometry.coordinates" : obj.geometry.coordinates[0]}, obj, {upsert : true}, function(err, result) {
      if (err) throw err;
      if (result) {
        console.log(count++);
      }
    })

  });
}

function readImage(d, image){
  var f = image.split("/");
  db.gridfs().open(d + "-" + f[f.length - 1], 'w', { metadata : { featureId : parseInt(d) }, content_type : "image/jpeg" }, function(err, gs, props) {
    var data = fs.readFileSync(image);
    gs.write(data, function(err, reply){

      if (err) throw err;

      if (reply) {
        console.log("OK")
      }
      
      gs.close(function(err, reply) {
        if (err) throw err;
      })
    }) 
  })
}

function read(dir, meta){
  var current = root + "/" + dir
  var data = fs.readdirSync(current);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    if (d.indexOf(".json") > -1 && meta) readFeature(current + "/" + d);
    if (d.indexOf(".jpg") > -1 && !meta) readImage(dir, current + "/" + d);

  }
}

for (var i = 0; i < features.length; i++) {
  var feature = features[i];
  if (!parseInt(feature)) continue;
  read(feature, false);
}