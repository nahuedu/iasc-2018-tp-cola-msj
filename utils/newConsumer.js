const getConsumerById = require('./getConsumerById');

module.exports = (msg, socket, statusManager) => {
  const topic = statusManager.topics.get(msg.topic);
  let consumer = {};
  let newConsumer = false;

  if (topic) {
    consumer = getConsumerById(msg.idConsumer, topic.consumers);
    if (consumer == null ) { 
      consumer = {
        id: msg.idConsumer ? msg.idConsumer : statusManager.idsConsumers++,
      };
      newConsumer = true;
    }


    consumer.working = false;

    if (topic.tipoCola === 'publicar_suscribir') {
      process.send({ tipo: "createQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id });
      socket.on('disconnect', () => {
        process.send({ tipo: "deleteQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id });
      });
    } else {
      socket.on('disconnect', () => {
        console.log(`disconnected: ${consumer.id}`);
        topic.consumers.delete(consumer.id);
        process.send({ tipo: 'removeConsumer', consumer: consumer.id });
      })
    }

    socket.on('working', msg => {

      const topic = statusManager.topics.get(msg.topic);
      if (topic) {
        const c = topic.consumers.get(consumer.id)
        c.working = msg.working;
      }

    });


    if (newConsumer) {
      console.log(`Voy a insertar consumer ${newConsumer}`);
      topic.consumers.set(consumer.id, consumer);
    } 

    socket.emit('status_topic', { success: true, idConsumer: consumer.id });
    return consumer.id;
  } else {
    socket.emit('status_topic', { success: false, message: "No existe el topic " + msg.topic });
    return null;
  }
};
