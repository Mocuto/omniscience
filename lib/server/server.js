/**
 * Module dependencies.
 */

var OMNI_URL = "/omniscience/omniscience.js";

var http = require("http")
var read = require('fs').readFileSync;
var debug = require('debug')('omniscience:server');

var Server = require("socket.io");

/**
 * Omniscience client source.
 */

var clientSharedOmni = read(require.resolve("../shared/omni.js"), 'utf-8');
var clientSharedThought = read(require.resolve("../shared/thought.js"), 'utf-8');
var clientStateHandler = read(require.resolve("../client/statehandler.js"), 'utf-8');
var clientThoughtHandler = read(require.resolve("../client/thoughthandler.js"), 'utf-8');
var clientConscience = read(require.resolve("../client/conscience.js"), 'utf-8');
var clientOmni = read(require.resolve("../client/omni.js"), 'utf-8');


var clientSourceSeparator = "\n/*-------------------------------------------*/\n";
var clientSource = [
	clientSharedOmni,
	clientSharedThought,
 	clientStateHandler,
 	clientThoughtHandler,
 	clientConscience,
	clientOmni
].join(clientSourceSeparator);


var clientVersion = 0.0; //TODO - Get client version from package.

omni.Server = function(server, options) {
	Server.call(this, server, options);
}

omni.Server.prototype = new Server({}, {});
omni.Server.constructor = omni.Server;

omni.Server.prototype.attachServe = function(srv) {

	Server.prototype.attachServe.call(this, srv);

	debug('attaching omni-client serving req handler');

	var url = OMNI_URL;
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