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
	response.send('success');
});

app.post('/test', function (request, response)
{
	console.log(request.body.item.message);

	var message = request.body.item.message.message;

	if (message.indexOf("ok") != -1) console.log("ok");

  	response.send("success");
});

app.post('/foos', function(request, response)
{
	var playerName = request.body.item.message.from.name;
	var playerMentionName = request.body.item.message.from.mention_name;
	var message = request.body.item.message.message;

	if (message.indexOf("in") != -1) {
		foosIn(playerName, playerMentionName);
	} else if (message.indexOf("out") != -1) {
		foosOut(playerName, playerMentionName);
	} else if (message.indexOf("gogogo") != -1) {
		foosGogogo();
	} else if (message.indexOf("who") != -1) {
		foosWho();
	} else if (message.indexOf("clear") != -1) {
		foosClear();
	} else {
		var usage = Array("Usage: /foos [COMMAND]");
		usage.push("<strong>in</strong> adds you to the current game queue");
		usage.push("<strong>out</strong> removes you from the current game queue");
		usage.push("<strong>gogogo</strong> notifies all players and clears the queue");
		usage.push("<strong>who</strong> lists the players in the queue");
		usage.push("<strong>clear</strong> clears the queue");
		sendToRoom(usage.join("<br>"));
	}

  	response.send('Success');
});

function foosIn(playerName, playerMentionName)
{
	console.log("Player In: " + playerMentionName);

	Player.findOne({mention_name: playerMentionName}, function(err, existingPlayer) {
  		if (existingPlayer) {
			sendToRoom(existingPlayer.name + " is getting impatient. Who @here is going to play?");
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
				  			if (playerNames.length == 1) {
				  				sendToRoom("@here " + playerNames[0] + " wants to foos. Use <strong>/foos in</strong> to join.");
				  			} else if (playerNames.length < 4) {
								sendToRoom("You are already in the queue.");
							} else {
								foosGogogo();
							}
				  		}
					});
				}
			});
  		}
  	});
}

function foosOut(playerName, playerMentionName)
{
	console.log("Player Out: " + playerMentionName);

	Player.findOne({mention_name: playerMentionName}, function(err, existingPlayer) {
  		if (existingPlayer) {
  			existingPlayer.remove(function(err) {
				sendToRoom(existingPlayer.name + " is lame.");
			});
  		}
  	});
}

function foosGogogo()
{
	var playerMentionNames = Array();
	Player.find(function(err, players) {
  		if (!err) {
  			if (players.length > 1) {
	  			for (var i = 0; i < players.length; i++) {
	  				var mentionName = players[i].mention_name;
	  				if (mentionName) {
	  					playerMentionNames.push("@" + mentionName);
	  				}
	  			}
				console.log("GOGOGO: " + playerMentionNames.join(" "));
				sendToRoom(playerMentionNames.join(" ") + " <strong>GO GO GO!</strong><br><img src='http://media.giphy.com/media/u4LHldXR1sJPy/giphy.gif'>");
				Player.remove({}, function (err) {
					if (err) console.log('Error deleting!');
				});
  			} else {
  				sendToRoom("Not enough players to start. Use <strong>/foos clear</strong> to clear the queue.");
  			}
  		}
	});
}

function foosWho()
{
	var playerNames = Array();
	Player.find(function(err, players) {
  		if (!err) {
  			if (players.length > 0) {
	  			for (var i = 0; i < players.length; i++) {
	  				var name = players[i].name;
	  				if (name) {
	  					playerNames.push(name);
	  				}
	  			}
				console.log("who: " + playerNames.join(" "));
				sendToRoom("On deck: " + playerNames.join(", "));
				Player.remove({}, function (err) {
					if (err) console.log('Error deleting!');
				});
			} else {
				sendToRoom("Nobody wants to play :(");
			}
  		}
	});
}

function foosClear()
{
	Player.remove({}, function (err) {
		if (err) {
			console.log('Error deleting!');
			sendToRoom("Oops, something went wrong.");
		} else {
			sendToRoom("Queue cleared");
		}
	});
}

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