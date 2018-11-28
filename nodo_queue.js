const mensajes = [];
let consumidor = null;

process.on('message', msg => {
	switch (msg.tipo) {
		case 'consumer':
			console.log(msg);
			consumidor = msg.consumidor;
			console.log('Mi consumidor es ' + consumidor);
			break;
		case "delete":
			if (consumidor == msg.consumidor) {
				console.log('me debo eliminar dropeo');
				process.disconnect()
			}
			break;
		case 'consumerRecibeMensajes':
			if (consumidor == msg.idConsumer || !consumidor) {
				if (mensajes.length > 0) {
					var mensaje = mensajes.shift();
					console.log("Resto mensajes: ",mensajes.length)
					process.send({ tipo: 'enviarMensaje', mensaje: mensaje, idConsumer: consumidor })
				}
			}
			break;
		default:
			mensajes.push(msg);
			console.log("Sumo mensaje: ",mensajes.length)
			if (mensajes.length >= 10) {
				process.send({ tipo: 'FULL' })
			}
			break;
	}
});
