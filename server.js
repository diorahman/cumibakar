#!/bin/env node

var express = require('express');
var mongoose = require('mongoose');
var serializer = require('serializer');
var app = express();
var Grid = require('gridfs-stream');

mongoose.connect('mongodb://localhost/akuisisi');
var api = require('./controller/api.js');

setTimeout(function(){
  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
  api.setGrid(gfs);  
}, 1000)

// check token
app.use(function(req, res, next){

  // asking for token, skip
  if(req.path.indexOf('api') < 0){
    next();

  }else{

    if(req.query.access_token || req.headers.authorization) {

      if(req.query.access_token){
        req.token = req.query.access_token
        return next()
      }

      if(req.headers.authorization){
        var temp = req.headers.authorization
        var tempArr = temp.split(" ")
        if(tempArr.length == 2){
          req.token = tempArr[1]
          return next()
        }else{

          res.send(400, {
            meta : 400,
            error_type : "AuthException",
            error_messages : "Access token is required"
          })

        }
      }
    }
    else {

      return res.send(400, {
        meta : 400,
        error_type : "AuthException",
        error_messages : "Access token is required"
      })
    }
  }
})

app.use(function(req, res, next){

  if(req.token){

    try{
      
      var temp = serializer.secureParse(req.token, 'cumi', 'bakar')

      if(typeof temp == 'object'){
        req.user = temp
      }
      next()
    }
    catch(e){

      res.send(400, {
        meta : 400,
        error_type : "AuthException",
        error_messages : "Invalid access token"
      })

    }
  }else{
    next()
  }
})

app.use(express.static(__dirname + '/public'))
app.use(express.bodyParser())

var api = require('./controller/api.js');
var service = require('./controller/service.js');

app.get('/features', api.list)
app.get('/features/:id', api.show)
app.post('/features/:id', api.update)
app.get('/features/:category/near', api.near)

app.get('/images/:id', api.images)
app.get('/image/:filename', api.image)
app.get('/thumb/:filename', api.thumb)

app.get('/image-meta/:filename', api.imageMeta)
app.post('/image-meta/:filename', api.imageMetaUpdate)

app.post('/image-del/:filename', api.imageDel)
app.post('/image-rec/:filename', api.imageRec)

// users
app.post('/users/token', service.token)
app.get('/api/1/me', service.me)
app.get('/api/1/me/position', service.mePosition)
app.get('/api/1/me/around', service.meArround)

// features
// category, near, count, max-distance, by me, by user id
app.get('/api/1/features', service.featureList)

// 
app.post('/api/1/features', service.featureUpdate)

app.get('/api/1/features/:id', service.feature)
app.get('/api/1/features/:id/images', service.featureImages)
app.get('/api/1/images/:filename', service.featureImage)
app.get('/api/1/thumbs/:filename', service.featureThumb)


app.listen(3000)