var Feature = require('../model/feature.js');
var _ = require('lodash')
var gfs;

exports.setGrid = function(grid) {
  gfs = grid;
}

exports.post = function(req, res) {
}

exports.save = function(req, res) {
}


function typeName(category){

  // sejarah/purbakala -> purbakala 
  // alam/objek alam -> objek_alam
  // air/pantai -> pantai, sungai, danau
  // kontemporer -> kontemporer
  // budaya/kultural -> kultural, museum
  // kuliner/restaurant -> restaurant
  // sekunder -> bandara_sipil, terminal, pelabuhan, hotel

  var types = []

  switch (category) {
    case 'purbakala' : types.push("msop:purbakala"); break;
    case 'alam' : types.push("msop:objek_alam"); break;
    case 'air' : types.push("msop:pantai"); break;
    case 'kontemporer' : types.push("msop:kontemporer"); break;
    case 'kultural' : types.push("msop:kultural"); types.push("msop:museum"); break;
    case 'kuliner' : types.push("msop:restaurant"); break;
    case 'sekunder' : types.push("msop:bandara_sipil"); types.push("msop:terminal"); types.push("msop:pelabuhan"); types.push("msop:hotel"); break;
    default: break;
  }

  return types;
}

exports.list = function(req, res) {

  var query = {}
  Feature.find(query, function(err, features){

    var results = [];
    for (var i = 0; i < features.length; i++) {
      var feature = {};
      var id = features[i].toJSON().id
      var title = features[i].toJSON().properties.title || "Untitled"
      var timestamp = features[i].toJSON().properties.timestamp
      feature.id = id;
      feature.title = title;
      feature.timestamp = timestamp;
      results.push(feature);
    }
    
    res.send(results);
  })
}

exports.show = function(req, res) {
  Feature.findOne({id : parseInt(req.params.id) }, function(err, feature) {
    res.send(feature)
  })
};

exports.update = function(req, res) {
  var body = _.pick(req.body, "id", "geometry", "properties");
  Feature.update({ id : parseInt(req.params.id) }, body,  { upsert : true }, function(err, numberAffected){
    if (err) return res.send(404, err.messsage);
    res.send({ ok : numberAffected});
  });
};

exports.images = function(req, res) {
  console.log(req.params.id)
  gfs.files.find( { "metadata.featureId": parseInt(req.params.id)}).toArray(function (err, files) {
    res.send(files)
  })
}

exports.image = function(req, res) {
  var readstream = gfs.createReadStream({ filename : req.params.filename });
  readstream.pipe(res);
}

exports.imageMeta = function(req, res) {
  gfs.files.find( { "filename": req.params.filename}).toArray(function (err, files) {
    res.send(files[0])
  })
}

exports.imageMetaUpdate = function(req, res) {
  gfs.files.find( { "filename": req.params.filename}).toArray(function (err, files) {
    if(files[0]) {
      var file = files[0];
      file.metadata = req.body;
      file.metadata.featureId = parseInt(file.metadata.featureId)
      
      gfs.files.update({ "filename": req.params.filename}, file, function(err){
        res.send({ ok : true})
      })
    }
  })
}

exports.imageDel = function(req, res) {

  gfs.files.find( { "filename": req.params.filename}).toArray(function (err, files) {
    if(files[0]) {
      var file = files[0];
      file.metadata.deleted = true;
      
      gfs.files.update({ "filename": req.params.filename}, file, function(err){
        res.send({ ok : true})
      })
    }
  })

}

exports.imageRec = function(req, res) {

  gfs.files.find( { "filename": req.params.filename}).toArray(function (err, files) {
    if(files[0]) {
      var file = files[0];
      delete file.metadata.deleted;
      
      gfs.files.update({ "filename": req.params.filename}, file, function(err){
        res.send({ ok : true})
      })
    }
  })

}



exports.near = function(req, res) {

  var latlng = req.query.latlng || "118.7249836260268,-8.616607370834329";
  var maxDistance = req.query.dist || 500 //~30km
  var num = req.query.num || 10
  var category = req.params.category || "alam"

  var query = []
  var types = typeName(category);

  for (var i = 0; i < types.length; i++) {
    query.push({ "properties.category" : types[i]})
  }

  var near = latlng.split(",");

  var geoNear = [
  { $geoNear: { near: [parseFloat(near[0]), parseFloat(near[1])], 
    distanceField: "dist.calculated", 
    maxDistance: maxDistance / 6371, // ~30 km 
    query: {$or : query}, 
    includeLocs: "dist.location", 
    distanceMultiplier : 6371,
    spherical : true,
    uniqueDocs: true, 
    limit : parseInt(num) }
  }];

  Feature.aggregate(geoNear, function(err, features){
    if (err) return res.send([]);
    else {
      res.send(features);
    }
  })
}