var io = require('socket.io-client')
var socket = io('http://127.0.0.1:3000');

socket.on('connect', function(){
	console.log("conectado")
});
socket.on('event', function(data){
	console.log(data)
});
socket.on('disconnect', function(){});
