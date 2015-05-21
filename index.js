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

	Player.findOne({mention_name: playerMentionName}, function(err, existingPlayer) {
  		if (existingPlayer) {
  			sendToRoom(existingPlayer.name + " is already playing.");
  		} else {
			var player = new Player ({ name: playerName, mention_name: playerMentionName });
			player.save(function (err) {
				if (err) {
					console.log('Error on save!');
				} else {
					console.log('Saved player: ' + playerName);

					//retrieve all current players
					var playerNames = Array();
					var playerMentionNames = Array();
					Player.find(function(err, players) {
				  		if (!err) {
				  			for (var i = 0; i < players.length; i++) {
				  				var name = players[i].name;
				  				if (name) {
				  					playerNames.push(name);
				  				}
				  				var mentionName = players[i].mention_name;
				  				if (mentionName) {
				  					playerMentionNames.push("@" + mentionName);
				  				}
				  			}
							if (playerNames.length < 4) {
								sendToRoom("Current players: " + playerNames.join(", "));
							} else {
								sendToRoom(playerMentionNames.join(" ") + " go go go!");
								Player.remove({}, function (err) {
									if (err) console.log('Error deleting!');
								});
							}
				  		}
					});
				}
			});
  		}
  	});


  	response.send('Success');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function sendToRoom(message)
{
	var request = require('request')

    request({
        url: process.env.HIPCHAT_URL,
        method: 'POST',
        qs: { 'auth_token': process.env.HIPCHAT_AUTH_TOKEN },
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