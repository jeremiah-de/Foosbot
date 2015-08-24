var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/beartoss', function (request, response)
{
	console.log(request.body.item.message);
	sendToRoom("<img src='http://data-live.s3.amazonaws.com/pgatour/gifs/bear_toss.gif'");
});

function sendToRoom(message)
{
	var request = require('request')

    request({
        url: process.env.HIPCHAT_URL,
        method: 'POST',
        qs: { 'auth_token': process.env.HIPCHAT_AUTH_TOKEN },
        json: { message: message, notify: true, message_format: 'html' },
        headers: { 'Content-Type' : 'application/json' }
    }, function(error, response, body) {
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(response.statusCode, body);
	    }
	});
}
