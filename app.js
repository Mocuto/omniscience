var express = require('express')
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var omni = require('./omniscience/server/omni');

var coffeeMiddleware = require('coffee-middleware');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'mocugame')))
app.use(express.static(path.join(__dirname, 'omniscience')))

app.get('/', function(req, res){
  res.render('index');
});

app.use(coffeeMiddleware({
    src: __dirname + '/public',
    compress: true
}));

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

omni.init(io);

var conscience = omni.conscience("test");
conscience.onClientConnected = function() {
  console.log("A client connected to Test!");
}

conscience.onThought("test", function(thought) {
    console.log("Thought receieved!")
    console.log(thought);
})


/*var clientsSocket = io.of('/clients');

clientsSocket.on('connection', function(socket){
  console.log("New connection")
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});*/

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

console.log("Test");

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//http.listen(3000);

module.exports = http