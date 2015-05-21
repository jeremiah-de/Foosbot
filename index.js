var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var mongoose = require ("mongoose");
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/HelloMongoose';
var theport = process.env.PORT || 5000;
mongoose.connect(uristring, function (err, res) {
  if (err) {
  	console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
	  console.log ('Succeeded connected to: ' + uristring);
  }
});

var foosSchema = new mongoose.Schema({
  player1: { type: String },
  player2: { type: String },
  player3: { type: String },
  player4: { type: String }
});
var Foos = mongoose.model('Foos', foosSchema);

app.get('/', function(request, response)
{
	var foos = new Foos ({ player1: "A", player2: "B", player3: "C", player4: "D" });
	foos.save(function (err) {if (err) console.log ('Error on save!')});

	response.send('Success');
});

app.get('/get', function (request, response)
{
	console.log(storage.getItem('name'));
	response.send('Success');
});

app.post('/foos', function(request, response)
{
	console.log(request.body);
  	res.json(request.body);
  	response.send('Success');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function sendToRoom(message)
{
	var request = require('request')

    request({
        url: 'https://api.hipchat.com/v2/room/1475277/notification',
        method: 'POST',
        qs: { 'auth_token': 'W22SSU8tc0lzHE3S854KKoNd4sTQAgpPai0Myd7V' },
        json: { message: message, notify: true },
        headers: { 'Content-Type' : 'application/json' }
    }, function(error, response, body) {
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(response.statusCode, body);
	    }
	});
}