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
				console.log('me dropeo');
				process.close();
			}
		case 'consumerRecibeMensajes':
			if (consumidor == msg.idConsumer || !consumidor) {
				if (mensajes.length > 0) {
					console.log('debo entregar este mensaje ');
					var mensaje = mensajes.shift();
					console.log(mensaje);
					process.send({ tipo: 'enviarMensaje', mensaje: mensaje, idConsumer: consumidor })
				}
			}
		default:
			mensajes.push(msg);
			console.log('tengo estos mensajes');
			console.log(mensajes);

			if (mensajes.length >= 10) {
				process.send({ tipo: 'FULL' })
			}
			break;
	}
});
