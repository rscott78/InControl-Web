
/**
 * Module dependencies.
 */

// These act like 'global' variables; accessible from any module
CLIENT = require('./modules/icha_client.js');
SERVERCONFIG = require('./config.js');

// Basic modules
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');
MOMENT = require('moment')

// Controllers 
var devicesRoute = require('./routes/devices');
var scenesRoute = require('./routes/scenes');
var messagesRoute = require('./routes/messages');
var eventsRoute = require('./routes/events');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views'); 
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use("/model", express.static(__dirname + "/model"));
  app.use("/node_modules", express.static(__dirname + "/node_modules"));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Routes for user interaction
app.get('/', eventsRoute.list);
app.get('/scenes', scenesRoute.list);
app.get('/devices', devicesRoute.list);

// Routes for ajax calls
app.post('/scenes/activate/:sceneId', scenesRoute.activate);
app.post('/device/:deviceId/setRoom', devicesRoute.setRoom);
app.get('/messages', messagesRoute.list);


httpServer = http.createServer(app).listen(app.get('port'), function(){
    console.log("InControl web server listening on port " + app.get('port'));

    // Start up the server connection to InControl
    CLIENT.startServer();
});

SOCKETIO = io.listen(httpServer);
SOCKETIO.sockets.on('connection', function (socket) {
  console.log("Connection!");

  socket.emit('message', 'Hello from the server!');

  socket.on('message', function (stuff) {
    console.log("message received", stuff);

    // Sends devices to the client
    if (stuff.command == "getDevices") {
      console.log("message getDevices received");
      socket.emit('message', { 
        messageType: "devices",
        devices: CLIENT.devices() 
      });
    }
  }); 

});