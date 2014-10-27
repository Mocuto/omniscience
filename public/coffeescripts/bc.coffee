BC = {};
window.BC = BC;

clientsSocket = io("/clients");

clientsSocket.connect(BC.onJoin)

BC.onJoin = () ->
	alert("Join!");

BC.onDisconnect = () ->
	alert("Disconnect!");