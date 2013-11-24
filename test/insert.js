var request = require('request')

var url = "http://localhost:3000/api/1/features?access_token=o7Eb6F06v3Xguy1zW6521a1p5ms=u4Dqz_qX7da867c091ae7b61d49d4b6a387a4a0f07af5036414b8be88b2263a679a4bbf9"
var feature = { "geometry" : { "type" : "Point", "coordinates" : [  115.12,  -8.808913333333333 ] }, "id" : 1384311808902, "properties" : { "categories" : [  "air" ], "note" : "Belanja", "address" : "komplek GWK", "description" : "Tempat oleh oleh khas GWK", "subtitle" : "Tempat belanja oleh oleh", "title" : "GWK souvenir shop", "timestamp" : "2013-11-13T03:04:17.000Z", "altitude" : 103.8, "accuracy" : 1.7000000476837158 }, "type" : "Feature" }
var a = { a : '1'}
//request.post({ url : url, body : JSON.stringify(feature), headers : { 'content-type' : "application/json"} }) 
request(url, function(a, b, c){
  console.log(a)
  console.log(c)
})