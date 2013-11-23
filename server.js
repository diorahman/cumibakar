#!/bin/env node

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var Grid = require('gridfs-stream');

mongoose.connect('mongodb://localhost/akuisisi');
var api = require('./controller/api.js');

setTimeout(function(){
  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
  api.setGrid(gfs);  
}, 1000)

app.configure(function () {
  app.use(express.static(__dirname + '/public'))
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);  
});

var api = require('./controller/api.js');

app.get('/features', api.list)
app.get('/features/:id', api.show)
app.post('/features/:id', api.update)
app.get('/features/:category/near', api.near)

app.get('/images/:id', api.images)
app.get('/image/:filename', api.image)

app.get('/image-meta/:filename', api.imageMeta)
app.post('/image-meta/:filename', api.imageMetaUpdate)

app.post('/image-del/:filename', api.imageDel)
app.post('/image-rec/:filename', api.imageRec)

app.listen(3000);





