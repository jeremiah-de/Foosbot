var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {

	var request = require('request')

    request({
        url: 'https://api.hipchat.com/v2/room/1475277/notification',
        method: 'POST',
        qs: { 'auth_token': 'W22SSU8tc0lzHE3S854KKoNd4sTQAgpPai0Myd7V' },
        json: { message: "@JeremiahGage", notify: true },
        headers: { 'Content-Type' : 'application/json' }
    }, function(error, response, body) {
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(response.statusCode, body);
	    }
	});

	response.send('Hello World!');
});

app.get('/foos', function(request, response) {

	var request = require('request')

    request({
        url: 'https://api.hipchat.com/v2/room/1475277/notification',
        method: 'POST',
        qs: { 'auth_token': 'W22SSU8tc0lzHE3S854KKoNd4sTQAgpPai0Myd7V' },
        json: { message: "let's foos", notify: true },
        headers: { 'Content-Type' : 'application/json' }
    }, function(error, response, body) {
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(response.statusCode, body);
	    }
	});

	response.send('Foos!');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
