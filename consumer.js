const io = require('socket.io-client');
const sleep = require('sleep');


class Consumer {

	constructor(topic, url){
		this.topic = topic;
		this.idConsumer = null;
		this.socket = io(url);
	}

	socketClient() {

		this.socket.on('connect', this.connect.bind(this));

		this.socket.on('disconnect', this.disconnect.bind(this));

		this.socket.on('status_topic', this.setIdConsumer.bind(this));

		this.socket.on('mensaje', this.mensaje.bind(this));
	}

	mensaje(msg) {
		console.log(msg.mensaje);
		sleep.sleep(5);
		this.socket.emit('working', { topic:this.topic, working: false });
	}

	disconnect() {
		console.log("Se desconecto")
	}

	connect() {
		this.socket.emit('conectar_topic', {
			topic: this.topic,
			idConsumer: this.idConsumer
		});
	}

	setIdConsumer(msg) {
		console.log(msg);
		this.idConsumer = msg.idConsumer;
	}

}


module.exports = Consumer;