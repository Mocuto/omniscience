BC = {};
window.BC = BC;

BC.onJoin = () ->
	alert("Join!");

BC.onDisconnect = () ->
	alert("Disconnect!");

clientsSocket = io("/clients");

clientsSocket.on('connect', BC.onJoin)

