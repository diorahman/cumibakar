var request = require('request')
var graphApi = "https://graph.facebook.com";
var fbToken = "CAACEdEose0cBAH6bGWBz13FWIJlXJUrmGZBl3vUpDDJ6UDjOVoXH9bCIWDYgNRd379p1pAixK9D1nZB19ZBeXIfkcaoZBY0osLnorduzDNsRcUpeaFpfp2boMZAx6G8hchxnUemw9CqZBo1FtMVQkJONL9y6xKaoXOfgNwRcVmqDZABeP4XZBxAAbZAPero4ZAmUk9JqKntYWsygZDZD"

function validateFacebookToken(token, callback){

  request(graphApi + "/me?access_token=" + token, function(err, res, body){

    console.log(body)

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

          console.log(body)

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

validateFacebookToken(fbToken, function(err, result){
  console.log(err)
  console.log(result)
});