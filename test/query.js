var Feature = require('../model/feature.js');
var User = require('../model/user.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/akuisisi');

var category = ['alam']

var categories = ""

console.log(categories.split(","))

function query(){

  Feature.find({ $and : [ {"properties.categories" : 'alam'}, {"properties.categories" : 'air'} ]}, function(err, result){
    console.log(result)
  })


}

query();