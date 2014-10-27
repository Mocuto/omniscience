var express = require('express')
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var coffeeMiddleware = require('coffee-middleware');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'mocugame')))
app.use(express.static(path.join(__dirname, 'omni')))

app.get('/', function(req, res){
  res.render('index');
});

app.use(coffeeMiddleware({
    src: __dirname + '/public',
    compress: true
}));

var clientsSocket = io.of('/clients');

clientsSocket.on('connection', function(socket){
  console.log("New connection")
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

module.exports = app