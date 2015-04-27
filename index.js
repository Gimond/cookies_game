var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
//var io = require('socket.io').listen(server);

// server.listen(80);
//server.listen(process.env.PORT || 3000);

app.get('/', function(request, response) {
  response.send('Hello, listening on port '+process.env.PORT);
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});