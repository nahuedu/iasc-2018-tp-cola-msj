const child_process = require('child_process');

var manager;
var queues = []
createManager()

function createManager() {
	var nodoManager = child_process.fork("nodo_manager.js")
	/* Administra mensajes recibidos*/
	nodoManager.on('message', function(msg){
		if (msg.tipo == "createQueue") {
			createQueue(msg.topic, msg.tipoCola)
		}
		else if (msg.tipo == "sendMsg") {
			queues.forEach( ( q ) => {
				if (q.topic == msg.topic)
					q.nodo.send(msg.msg)
			})
		}
    });

	manager = {nodo: nodoManager, replica: null}
    return nodoManager
}

function createQueue(topic, tipoCola) {

	var nodoQueue = child_process.fork("nodo_queue.js")
	//var nodoQueueReplica = child_process.fork("nodo_queue.js")

	nodoQueue.on('message', function(msg){
		if (msg.tipo == "FULL") {
			manager.nodo.send({topic: topic, msg: msg.tipo})
		}
    });

	queues.push({topic: topic, nodo: nodoQueue, replica: null})
    return nodoQueue
}