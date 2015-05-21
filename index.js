var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

var playerSchema = new mongoose.Schema({
  name: { type: String },
  mention_name: { type: String }
});
var Player = mongoose.model('Player', playerSchema);

app.get('/', function(request, response)
{
	response.send('Success');
});

app.get('/get', function (request, response)
{
	Player.find(function(err, players) {
  		if (err) {
			response.send('Error: ' + err);
  			return console.error(err);
  		}
  		response.send(players);
	});
});

app.post('/foos', function(request, response)
{
	var playerName = request.body.item.message.from.name;
	var playerMentionName = request.body.item.message.from.mention_name;
	console.log("Player: " + playerName);

	var player = new Player ({ name: playerName, mention_name: playerMentionName });
	player.save(function (err) { if (err) console.log('Error on save!'); else console.log('Saved player: ' + playerName); } );

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