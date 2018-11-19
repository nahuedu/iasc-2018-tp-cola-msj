var io = require('socket.io-client')
var socket = io(process.env["MASTER"]);
var sleep = require('sleep');

socket.on('connect', function(){
	socket.emit('conectar_topic', { topic: process.env["TOPIC"] });
});

socket.on('status_topic', function(msg){
	console.log(msg)
});

socket.on('mensaje', function(msg){
	console.log(msg.mensaje)
	sleep.sleep(10)
	socket.emit('working', { topic: process.env["TOPIC"], working: false });
});