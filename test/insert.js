var request = require('request')

var url = "http://localhost:3000/api/1/features/1384311808902/images?access_token=7wmMhjrfjvIX7BrmxH9_F3rISqo=ZBa_WmfK0a61fc0a93250f32098df68460839a83f514247e20d90206c49673df4e0cb9f5"
var feature = { "geometry" : { "type" : "Point", "coordinates" : [  115.12,  -8.808913333333333 ] }, "id" : 1384311808902, "properties" : { "categories" : [  "air" ], "note" : "Belanja", "address" : "komplek GWK", "description" : "Tempat oleh oleh khas GWK", "subtitle" : "Tempat belanja oleh oleh", "title" : "GWK souvenir shop", "timestamp" : "2013-11-13T03:04:17.000Z", "altitude" : 103.8, "accuracy" : 1.7000000476837158 }, "type" : "Feature" }

//request.post({ url : url, body : JSON.stringify(feature), headers : { 'content-type' : "application/json"} }) 
request(url, function(a, b, c){
  console.log(a)
  console.log(c)
})