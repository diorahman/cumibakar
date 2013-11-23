var fs = require("fs")
var skin = require('mongoskin');
var db = skin.db('localhost:27017/akuisisi', { safe : true}); 

var root = __dirname + "/../data/Cumi/data";

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

function read(dir){
  var current = root + "/" + dir
  var data = fs.readdirSync(current);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    if (d.indexOf(".jpg") > -1) readImage(dir, current + "/" + d);

  }
}
read(1384311808902)

