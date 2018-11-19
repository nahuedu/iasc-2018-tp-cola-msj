
var mensajes = []
var consumidor = null

process.on('message', (msg) => {
	if (msg.tipo == "consumer") {
		console.log(msg)
		consumidor = msg.consumidor
		console.log("Mi consumidor es "+consumidor)
	} 
	else if (msg.tipo == "delete") {
		
		if (consumidor == msg.consumidor) {
			console.log("me dropeo")
			process.close()
		}
		
	} 
	else if (msg.tipo == "consumerRecibeMensajes") {
		if (consumidor == msg.idConsumer || consumidor == null) {
			if (mensajes.length > 0) {
				console.log("debo entregar este mensaje ")
				var mensaje = mensajes.shift()
				console.log(mensaje)
				process.send({tipo: "enviarMensaje", mensaje: mensaje, idConsumer: consumidor})
			}
		}
	} else {
		mensajes.push(msg)
		console.log("tengo estos mensajes")
		console.log(mensajes)

		if (mensajes.length >= 10) {
			process.send({tipo: "FULL"})
		}
	}
})
