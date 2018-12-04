const io = require('socket.io-client');
const sleep = require('sleep');


class ConsumerClientSocket {

	constructor(topicTitle, url){
		this.topicTitle = topicTitle;
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
		sleep.sleep(1);
		this.socket.emit('working', { topicTitle:this.topicTitle, working: false });
	}

	disconnect() {
		console.log("se fue")
		this.socketClient()
	}

	connect() {

		this.socket.emit('conectar_topic', {
			topicTitle: this.topicTitle,
			consumerId: this.idConsumer
		});
	}

	setIdConsumer(msg) {
		if(msg.success) {
			console.log(`conectado! mi id es ${msg.idConsumer}`);
			this.idConsumer = msg.idConsumer;
		}
		else
			console.log(msg.message);
	}

}


module.exports = ConsumerClientSocket;