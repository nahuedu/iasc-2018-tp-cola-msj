const uuidv4 = require('uuid/v4');
var MAXIMO = 1000
var statusQueue = {
	mensajes: [],
	consumidor: null,
	original: false,
}

process.on('message', msg => {
	if (statusQueue.original == true) {
		handleMessageOriginal(msg)
	} else {
		handleMessageReplica(msg)
	}
});


function handleMessageOriginal(msg) {
	switch (msg.tipo) {
		case "delete":
			if (statusQueue.consumidor == msg.consumidor) {
				console.log("Soy queue "+process.pid+": Me debo eliminar");
				process.disconnect()
				process.exit()
			}
			break;
		case 'consumerRecibeMensajes':
			if (statusQueue.consumidor == msg.idConsumer || !statusQueue.consumidor) {
				if (statusQueue.mensajes.length > 0) {
					var mensaje = statusQueue.mensajes.shift();
					console.log(mensaje.id);
					console.log("Soy queue "+process.pid+": Resto mensaje: Tengo ",statusQueue.mensajes.length)
					process.send({ tipo: 'enviarMensaje', mensaje: mensaje, idConsumer: statusQueue.consumidor })
				}
				if (statusQueue.mensajes.length  < MAXIMO) {
					process.send({ tipo: 'AVAILABLE' })
				}
			}
			break;
		case 'sendMsg':
			msg.msg.id = uuidv4();
			statusQueue.mensajes.push(msg.msg);
			console.log("Soy queue "+process.pid+": Sumo mensaje: Tengo ",statusQueue.mensajes.length)
			if (statusQueue.mensajes.length >= MAXIMO) {
				process.send({ tipo: 'FULL' })
			}
			break;
		default:
			console.log(msg)
	}
}

function handleMessageReplica(msg) {
	switch (msg.tipo) {
		case "delete":
			if (statusQueue.consumidor == msg.consumidor) {
				console.log("Soy queue "+process.pid+": Me debo eliminar");
				process.disconnect()
				process.exit()
			}
			break;
		case 'init':
			statusQueue.consumidor = msg.consumidor;
			statusQueue.original = msg.original;
			process.send({tipo: "soyOriginal" })  
			console.log("Soy queue "+process.pid+": Mi consumidor es " + statusQueue.consumidor + ' y original es '+statusQueue.original);
			break;
		case 'toReplica':
			statusQueue = msg.status
			statusQueue.original = false;
			break;
	}
}



setInterval(() => {
	if (statusQueue.original){
			process.send({tipo: "toReplica", status: statusQueue })  
		}
}, 10);

/*
setInterval(() => {
	if (statusQueue.original){
			console.log("Soy queue y mi status es:", statusQueue)
		}
}, 5000);

*/