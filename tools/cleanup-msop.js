var skin = require('mongoskin');
var request = require('request')
var url = require('url');
var db = skin.db('localhost:27017/akuisisi', { safe : true}); 

db.collection('features').find({'geometry_name' : { $exists : true}}).toArray(function(err, data){
  for (var i = 0; i < data.length; i++) {
    console.log(data[i])
    db.collection('features').remove({_id : data[i]._id}, function(err){
      console.log(err)
    })
  }
})
