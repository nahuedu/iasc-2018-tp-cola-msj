class Consumer {

    constructor(idConsumer, statusManager, socket, topic){
        this.id = idConsumer !== null && idConsumer !== undefined ? idConsumer : statusManager.idsConsumers++;
        console.log(`Nuevo consumer con id ${this.id}`);
        this.working = false;

        socket.on('working', msg => {
            this.setWorking(msg.working);
        });

        if (topic.tipoCola == 'publicar_suscribir') {
            process.send({ tipo: "createQueue", topic: topic.topicTitle, tipoCola: topic.tipoCola, idConsumer: this.id });
            socket.on('disconnect', () => {
                console.log(`disconnected: ${this.id}`);
                process.send({ tipo: "deleteQueue", topic: topic.topicTitle, tipoCola: topic.tipoCola, idConsumer: this.id });
            });
        }

        if (topic.tipoCola == 'cola_de_trabajo') {
            socket.on('disconnect', () => {
                console.log(`disconnected: ${this.id}`);
                process.send({ tipo: "removeConsumer", topic: topic.topicTitle, tipoCola: topic.tipoCola, idConsumer: this.id });
            });
        }
    }

    notWorking(){
        this.working = false;
    }

    setWorking(work){
        this.working = work;
    }

    sendMessageToProcess(process, topicTitle){
        if (!this.working) {
            process.send({ tipo: 'consumerRecibeMensajes', topicTitle: topicTitle, idConsumer: this.id });//lo recibe master.js
        }
    }

    sendMessageToSocket(msg, socket) {
        if (!this.working) {
          socket.emit('mensaje', { mensaje: msg.mensaje });
          this.working = true;

          setTimeout( () => {
            //si a los 10 segundos no confirmo accion, reencolar
          }, 10000 ) 
        }
    }
}

module.exports = Consumer;