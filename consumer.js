const io = require('socket.io-client');
const sleep = require('sleep');


class Consumer {

	constructor(topic, url, transactional){
		this.topic = topic;
		this.idConsumer = null;
		this.transactional = transactional;
		this.socket = io(url);
	}

	socketClient() {

		this.socket.on('connect', this.connect.bind(this));

		this.socket.on('disconnect', this.disconnect.bind(this));

		this.socket.on('status_topic', this.setIdConsumer.bind(this));

		this.socket.on('mensaje', this.mensaje.bind(this));
	}

	mensaje(msg) {
		console.log(msg.mensaje.id);
		//Non Transactional consumption -> Emit the ACK before processing
		if(!this.transactional){
			this.socket.emit('working', { msgId: msg.mensaje.id, topic:this.topic, working: false });	
		} 

		//Simulates consumer processing
		console.log(msg.mensaje);
		sleep.sleep(5); 
		
		//Transactional consumption -> Emit the ACK after processing, if successfull
		if(this.transactional){
			this.socket.emit('working', { msgId:msg.mensaje.id, topic:this.topic, working: false });	
		}
		
	}

	disconnect() {
		console.log("se fue")
		this.socketClient()
	}

	connect() {

		this.socket.emit('conectar_topic', {
			topic: this.topic,
			consumerId: this.consumerId
		});
	}

	setIdConsumer(msg) {
		console.log(msg);
		this.idConsumer = msg.idConsumer;
	}

}


module.exports = Consumer;