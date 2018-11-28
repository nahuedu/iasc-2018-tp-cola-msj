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
				console.log('me debo eliminar dropeo');
				process.disconnect()
			}
			break;
		case 'consumerRecibeMensajes':
			if (statusQueue.consumidor == msg.idConsumer || !statusQueue.consumidor) {
				if (statusQueue.mensajes.length > 0) {
					var mensaje = statusQueue.mensajes.shift();
					console.log("Resto mensajes: ",statusQueue.mensajes.length)
					process.send({ tipo: 'enviarMensaje', mensaje: mensaje, idConsumer: statusQueue.consumidor })
				}
			}
			break;
		case 'sendMsg':
			statusQueue.mensajes.push(msg.msg);
			console.log("Sumo mensaje: ",statusQueue.mensajes.length)
			if (statusQueue.mensajes.length >= 10) {
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
				console.log('me debo eliminar dropeo');
				process.disconnect()
			}
			break;
		case 'init':
			statusQueue.consumidor = msg.consumidor;
			statusQueue.original = msg.original;
			process.send({tipo: "soyOriginal" })  
			console.log('Mi consumidor es ' + statusQueue.consumidor + ' y original es '+statusQueue.original);
			break;
		case 'toReplica':
			statusQueue = msg.status
			statusQueue.original = false;
			break;
	}
}



setInterval(() => {
	if (statusQueue.original){
			console.log("Mi status es:", statusQueue)
			process.send({tipo: "toReplica", status: statusQueue })  
		}
}, 3000);
