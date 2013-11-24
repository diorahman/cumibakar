var Feature = require('../model/feature.js');
var User = require('../model/user.js');
var request = require('request')
var serializer = require('serializer')
var graphApi = "https://graph.facebook.com";

function validateFacebookToken(token, callback){

  request(graphApi + "/me?access_token=" + token, function(err, res, body){
    if (err) { 
      return callback(new Error("Error validating token to facebook"));
    }
    else {
      var objUser = JSON.parse(body)
      
      if (objUser.error) {
        return callback(new Error(obj.error.message));
      }
      else {
        
        request(graphApi + "/app/?access_token=" + token, function(err, res, body){
          if (err) { 
            return callback(new Error("Error validating token to facebook"));
          } else {
            var objApp = JSON.parse(body);

            if (objApp.error) {
              return callback(new Error(obj.error.message));
            } else {
              callback(null, {user : objUser, app : objApp})
            }
          }
        })
      }
    }
  })
}


// /api/1/token
exports.token = function(req, res) {
  var token = req.body.token

  if (token) {
    validateFacebookToken(token, function(err, result){
      
      var user = result.user;
      
      var objUser = {
        id : user.id,
        profile : user,
        timestamp : new Date()
      }

      User.update({ id : user.id}, objUser, { upsert : true}, function(err, result){
        if (err) return res.send(400, { error : 'Error'})
        else {
          res.send({ token : serializer.secureStringify({ id : user.id } , 'cumi', 'bakar') })
        }
      })
    })
  }
} 

exports.me = function(req, res) {
  User.findOne(req.user, function(err, user) {
    if (err) return res.send(400, { error : err.message})
    res.send(user.profile)
  })
}

exports.featureUpdate = function(req, res) {

  var feature = req.body;

  User.findOne(req.user, function(err, user) {
    if (err) return res.send(400, { error : err.message})
    else {
      
      feature._creator = user._id

      Feature.update({ id : feature.id }, feature, { upsert : true}, function(err, result){
        if (err) res.send( 400, { error : err.message } )
        res.send({ ok : true})
      })
    }
  })
}

function featureMine(req, res) {

  var feature = req.body;
  
  User.findOne(req.user, function(err, user) {
    if (err) return res.send(400, { error : err.message })
    else {

      Feature.find({ _creator : user._id} , function(err, features) {
        if (err) return res.send(400, { error : err.message })
        else {
          res.send(features)
        }
      })
    }
  })
}

exports.featureList = function(req, res) {

  var query = {}
  var operator = req.query.operator || "or";
  var categories = req.query.categories || "";
  var latlng = req.query.latlng || "-8.808913333333333,115.12";
  var maxDistance = req.query.dist || 200 
  var num = req.query.num || 10 

  if (categories) {
    var arr = categories.split("")
    var categoriesQuery = []
    for (var i = 0; i < arr.length; i++) {
      var q = { "properties.categories" : arr[i].toLowerCase().trim() }
      categoriesQuery.push(q)
    }

    if (operator == "or") {
      query = { $or : categoriesQuery}
    } else {
      query = { $and : categoriesQuery}
    }
  }

  var near = latlng.split(",");

  var geoNear = [
  { $geoNear: 
    { near: [parseFloat(near[1]), parseFloat(near[0])], 
    distanceField: "dist.calculated", 
    maxDistance: maxDistance / 6371, 
    query: query, 
    includeLocs: "dist.location", 
    distanceMultiplier : 6371,
    spherical : true,
    uniqueDocs: true, 
    limit : parseInt(num) }
  }];

  Feature.aggregate(geoNear, function(err, features){

    if (err) return res.send(400, { error : err.message);
    else {
      res.send(features);
    }
  })

}

exports.feature = function(req, res) {

  if (req.params.id == 'mine') {
    return featureMine(req, res);
  }

  Feature
  .findOne({id : parseInt(req.params.id) })
  .populate('_creator', 'profile')
  .exec(function (err, feature) {
    if (err) res.send({ error : err.message})
    res.send(feature)
  })

}