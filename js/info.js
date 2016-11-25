//generate auth parameters for Yelp API
//Credit: https://gist.github.com/nathanhood/24771584f042d715e8f0
var getParameters = function(name, lat, lng) {
  var auth = {
    consumerKey: "lbkfcnGIMeTlM7Px8FkCIA",
    consumerSecret: "yKLuXy8swh-vPdGVgy76pBe1LlY",
    accessToken: "PyLoPasRa66qwWctTJu0PVuExec4zEVN",
    accessTokenSecret: "hBIBGWw0Q7iHP3ZqBj7F0GNNLv8",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };
  var terms = name;
  var near = lat + ', ' + lng;
  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };
  parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['ll', near]);
  parameters.push(['callback', 'cb']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
  var message = {
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
  return [message,parameterMap];
}

//exact necessary data from Yelp API
function extactInfo(result) {
  var business;
  var content = "";
  if(result.hasOwnProperty('businesses')) {
    if(Array.isArray(result['businesses']) && result['businesses'].length>0) {
      business = result['businesses'][0];
    }
  }
  if(typeof business != 'undefined') {
    if(business.hasOwnProperty('name')) {
      content += '<h2>'+business.name+'</h2>';
    }
    if(business.hasOwnProperty('display_phone')) {
      content += '<p>'+business.display_phone+'</p>';
    }
    if(business.hasOwnProperty('rating')) {
      content += '<p>Yelp Rating: '+business.rating+'</p>';
    }
  } else {
    content += '<h5>Yelp data is not availalbe now.</h5>';
  }
  return content;
}