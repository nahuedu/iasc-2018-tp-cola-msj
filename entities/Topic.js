const utils = require('../utils/Utils');

class Topic {

    constructor(topicTitle, tipoCola){
        this.topicTitle = topicTitle;
        this.tipoCola = tipoCola;
        this.lleno = false;
        this.consumers = [];
    }

    llenate() {
        this.lleno = true;
    }

    vaciate() {
        this.lleno = false;
    }

    emitirMensaje(msg, socket) {
        const consumer = this.consumers.find(c => c.id === msg.idConsumer);
        consumer.sendMessageToSocket(msg, socket);
    }

    getConsumerById(id) {
        return this.consumers.find(c => id === c.id);
    }

    addConsumer(consumer){
        this.consumers.push(consumer);
    }

    sendMessages(process) {
        this.consumers.forEach(consumer => consumer.sendMessageToProcess(process, this.topicTitle))
    }

    updateWorkingConsumer(idConsumer, working){
        this.consumers.forEach(c => {
            if (c.id === idConsumer) {
                c.setWorking(working)
            }
        });
    }

    deleteConsumer(consumer){
        this.consumers = this.consumers.filter(c => c.id !== consumer.id);
    }
}


module.exports = Topic;