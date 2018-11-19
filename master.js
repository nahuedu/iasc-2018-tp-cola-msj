const child_process = require('child_process');

var manager;
var queues = []
createManager()

function createManager() {
	var nodoManager = child_process.fork("nodo_manager.js")
	/* Administra mensajes recibidos*/
	nodoManager.on('message', function(msg){
		if (msg.tipo == "createQueue") {
			createQueue(msg.topic, msg.tipoCola, msg.idConsumer)
		}
		else if (msg.tipo == "deleteQueue") {
			deleteQueue(msg.topic, msg.tipoCola, msg.idConsumer)	
		}
		else if (msg.tipo == "sendMsg") {
			queues.forEach( ( q ) => {
				if (q.topic == msg.topic)
					q.nodo.send(msg.msg)
			})
		}
		else if (msg.tipo == "consumerRecibeMensajes") {
			queues.forEach( ( q ) => {
				if (q.topic == msg.topic)
					q.nodo.send(msg)
			})
		}
    });

	manager = {nodo: nodoManager, replica: null}
    return nodoManager
}

function deleteQueue(topic, tipoCola, idConsumer) {
	if (tipoCola == "publicar_suscribir") {
		queues.forEach( (q) => {
			if (q.topic == topic) {
				q.nodo.send({tipo: "delete", consumidor: idConsumer})
			}
		})
	}
}
function createQueue(topic, tipoCola, idConsumer) {

	var nodoQueue = child_process.fork("nodo_queue.js")
	//var nodoQueueReplica = child_process.fork("nodo_queue.js")

	nodoQueue.on('message', function(msg){
		if (msg.tipo == "FULL") {
			manager.nodo.send({topic: topic, msg: msg.tipo})
		} else if (msg.tipo == "enviarMensaje") {
			manager.nodo.send({topic: topic, tipo: msg.tipo, mensaje: msg.mensaje, idConsumer: msg.idConsumer})
		}
    });

	nodoQueue.send({tipo: "consumer", consumidor: idConsumer})

	queues.push({topic: topic, nodo: nodoQueue, replica: null})
    return nodoQueue
}