const io = require('socket.io-client');
const config = require('config');
const sleep = require('sleep');

const topic = config.get('consumer.topic');
var idConsumer = null;

function socketClient() {
	const socket = io(config.get('master.host'));

	socket.on('connect', () => {
	  socket.emit('conectar_topic', { topic, idConsumer });
	});

	socket.on('disconnect', () => {
		console.log("se fue")
		socketClient()
	});

	socket.on('status_topic', msg => {
	  console.log(msg);
	  idConsumer = msg.idConsumer
	});

	socket.on('mensaje', msg => {
	  console.log(msg.mensaje);
	  sleep.sleep(5);
	  socket.emit('working', { topic, working: false });
	});
}


socketClient()