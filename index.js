var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// server.listen(80);
//server.listen(process.env.PORT || 3000);
server.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.get('/', function(request, response) {
  response.send(process.env.PORT);
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});


var id_joueurs = {};
var joueurs = {};

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(joueur){
		// we store the id_joueur in the socket session for this client
		// console.log(joueur);

		socket.id_joueur = joueur.id_joueur;
		console.log(socket.id_joueur+" connected");

		joueurs[socket.id_joueur] = {};
		joueurs[socket.id_joueur].id_joueur = joueur.id_joueur;
		joueurs[socket.id_joueur].vitesse = 2; //Math.floor(Math.random()*2)+1
		joueurs[socket.id_joueur].nom = joueur.nom;
		joueurs[socket.id_joueur].x = Math.floor(Math.random()*500)+100;
		joueurs[socket.id_joueur].haut = false;
		joueurs[socket.id_joueur].gauche = false;
		joueurs[socket.id_joueur].droite = false;

		// socket.emit('updatechat', 'SERVER', 'you have connected');

		// socket.broadcast.emit('update_joueurs', joueurs);
		io.sockets.emit('update_joueurs', joueurs);
		// update the list of users in chat, client-side
	});

	socket.on('bouge', function(data){
		joueurs[socket.id_joueur].haut = false;
		joueurs[socket.id_joueur].gauche = false;
		joueurs[socket.id_joueur].droite = false;

		if (data != ""){
			if (data.indexOf('haut') !== -1)
				joueurs[socket.id_joueur].haut = true;
			if (data.indexOf('gauche') !== -1)
				joueurs[socket.id_joueur].gauche = true;
			if (data.indexOf('droite') !== -1)
				joueurs[socket.id_joueur].droite = true;
		}
		socket.broadcast.emit('bouge_joueurs', joueurs);
	});

	socket.on('sync_pos', function(data){
		if (joueurs[socket.id_joueur] != undefined){
			joueurs[socket.id_joueur].x = data[0];
			socket.broadcast.emit('update_pos', [socket.id_joueur, data[0]]);
		}
	});

    socket.on('jump', function(data){
        console.log("jump "+data);
        if (joueurs[data] != undefined){
            io.sockets.emit('jump', data);
        }
    });

	socket.on('message', function(data){
		console.log("message recu "+data);
		io.sockets.emit('parle', [socket.id_joueur, data]);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		console.log(socket.id_joueur+" disconnected");
		delete joueurs[socket.id_joueur];
		socket.broadcast.emit('destroy_joueur', socket.id_joueur);
		// socket.close();
		// socket.disconnect();
	});

	socket.on('absent', function(){
		delete joueurs[socket.id_joueur];
		socket.broadcast.emit('destroy_joueur', socket.id_joueur);
		// socket.close();
		// socket.emit('updatechat', 'SERVER', 'you have connected');
		// socket.disconnect();
	});

});
