/**
 * Module dependencies.
 */

var http = require("http")
var read = require('fs').readFileSync;

var Server = require("socket.io");

/**
 * Omniscience client source.
 */

var clientSharedOmni = read("../shared/omni.js", , 'utf-8');
var clientSharedThought = read("../shared/thought.js", , 'utf-8');
var clientOmni = read("../client/omni.js", 'utf-8');
var clientStateHandler = read("../client/statehandler.js", 'utf-8');
var clientThoughtHandler = read("../client/thoughthandler.js", 'utf-8');
var clientConscience = read("../client/conscience.js", 'utf-8');

var clientSource = clientSharedOmni + clientSharedThought + clientOmni + clientStateHandler + clientThoughtHandler + clientConscience;
var clientVersion = 0.0; //TODO - Get client version from package.

omni.Server = function(server, options) {
	Server.call(this, server, options);
}

omni.Server.prototype = new Server(null, {});
omni.Server.constructor = omni.Server;

omni.Server.prototype.attachServ = function(srv) {

	Server.prototype.attachServ.call(this, srv);

	debug('attaching omni-client serving req handler');

	var url = '/omniscience/omniscience.js';
	var evs = srv.listeners('request').slice(0);
	var self = this;
	srv.removeAllListeners('request');
	srv.on('request', function(req, res) {
		if (0 == req.url.indexOf(url))
		{
			self.serveOmni(req, res);
		} 
		else
		{
			for (var i = 0; i < evs.length; i++)
			{
				evs[i].call(srv, req, res);
			}
		}
	});
};

omni.Server.prototype.serveOmni = function(req, res){
  var etag = req.headers['if-none-match'];
  if (etag) {
    if (clientVersion == etag) {
      debug('serve client 304');
      res.writeHead(304);
      res.end();
      return;
    }
  }

  debug('serve client source');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('ETag', clientVersion);
  res.writeHead(200);
  res.end(clientSource);
};