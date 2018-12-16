const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ioClient = require('socket.io-client');
io.origins('*:*');
const conn = require('./utils/Connections');

var MAXIMO = 1000;
var socketMaster = null;
var statusQueue = {
	mensajesReplicar: [],
	mensajes: [],
	consumidor: false,
	original: false,
	tipoCola: null
};

process.on('message', msg => {
	if (statusQueue.original) {
		handleMessageOriginal(msg);
	} else {
		handleMessageReplica(msg);
	}
});

function handleMessageOriginal(msg) {
	switch (msg.tipo) {
		case "delete":
			if (statusQueue.consumidor === msg.consumidor) {
				console.log(`Soy queue ${process.pid}: Me debo eliminar`);
				process.disconnect();
				process.exit();
			}
			break;
		case 'consumerRecibeMensajes':
			if (statusQueue.consumidor === msg.idConsumer || !statusQueue.consumidor) {
				if (statusQueue.mensajes.length > 0) {
					const mensaje = statusQueue.mensajes.shift();
					statusQueue.mensajesReplicar.push({add: false, msg: msg.msg});
					console.log(`Soy queue ${process.pid}: Resto mensaje: Tengo ${statusQueue.mensajes.length}`);
					process.send({ tipo: 'enviarMensaje', mensaje, idConsumer: statusQueue.consumidor, tipoCola: statusQueue.tipoCola });
					console.log({ tipo: 'enviarMensaje', mensaje, idConsumer: statusQueue.consumidor, tipoCola: statusQueue.tipoCola })
				}
				if (statusQueue.mensajes.length < MAXIMO) {
					process.send({ tipo: 'AVAILABLE' });
				}
			}
			break;
		case 'sendMsg':
			statusQueue.mensajes.push(msg.msg);
			statusQueue.mensajesReplicar.push({add: true, msg: msg.msg});
			console.log(`Soy queue ${process.pid}: Sumo mensaje: Tengo ${statusQueue.mensajes.length}`);
			if (statusQueue.mensajes.length >= MAXIMO) {
				process.send({ tipo: 'FULL' });
			}
			break;
		default:
			console.log(msg);
	}
}

function handleMessageReplica(msg) {
	switch (msg.tipo) {
		case "delete":
			if (statusQueue.consumidor === msg.consumidor) {
				console.log(`Soy queue ${process.pid}: Me debo eliminar`);
				process.disconnect();
				process.exit();
			}
			break;
		case 'init':
			init(msg)
			break;
		default:
			console.log(msg);
			break;
	}
}

function manageReplicaMsg(msg)  {
	if (msg.mensajes && msg.mensajes.length > 0) {
		for (var i = 0; i < msg.mensajes.length; i++ ) {
			if (msg.mensajes[i].add)
				statusQueue.mensajes.push(msg.mensajes[i].msg)
			else {
				const mensaje = statusQueue.mensajes.shift();
				//if (mensaje !== msg.mensajes[i].msg) {console.log(mensaje, msg.mensajes[i]);throw Error("Error de insconsistencia en la replicacion")}
			}
		}
	}
}

function init(msg) {
	if (msg.tipoCola)
		statusQueue.tipoCola = msg.tipoCola;
	if (msg.consumidor)
		statusQueue.consumidor = msg.consumidor;
	if (msg.original)
		statusQueue.original = msg.original;
	if (msg.original) {
		process.send({ tipo: "soyOriginal" });

		if (socketMaster) socketMaster.disconnect() //Si fue replica, debe desconectarse del antiguo master

		http.listen({ host: msg.host, port: msg.port }, () => {
	      console.log(`Recibiendo conexiones de replicacion ${msg.host}:${msg.port}`);
	    });

	    io.on('connection', socket => {
	      console.log(`connected: ${socket.id}`);
	      const replicasEstadoActual = []
	      for (var i = 0; i < statusQueue.mensajes.length; i++) {
	      	replicasEstadoActual.push({add: true, msg: statusQueue.mensajes[i]})
	      }
		  socket.emit('toReplica',{ tipo: "toReplica", mensajes: replicasEstadoActual })		      
	      setInterval(() => {
					if (statusQueue.original) {
						socket.emit('toReplica',{ tipo: "toReplica", mensajes: statusQueue.mensajesReplicar })
						statusQueue.mensajesReplicar = []
					}
				}, 1000);
	    });
	} else {
		socketMaster = ioClient(`http://localhost:${msg.port}`);
		socketMaster.on('toReplica', msg => {
				//console.log("envio",msg)
			 	manageReplicaMsg(msg)
			});
	}
	if(statusQueue.tipoCola == "cola_de_trabajo")
		console.log(`Nuevo nodo queue con topic:${msg.topic} | pid:${process.pid} | original:${statusQueue.original} | tipo:${statusQueue.tipoCola}`);
	if(statusQueue.tipoCola == "publicar_suscribir")
		console.log(`Nuevo nodo queue con topic:${msg.topic} | pid:${process.pid} | original:${statusQueue.original} | tipo:${statusQueue.tipoCola} | consumer:${statusQueue.consumidor}`);
}