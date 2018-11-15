var express = require('express');
var app = express();

var mensajes = []

process.on('message', (msg) => {
	mensajes.push(msg)
	console.log("tengo estos mensajes")
	console.log(mensajes)

	if (mensajes.length >= 10) {
		process.send({tipo: "FULL"})
	}
})
