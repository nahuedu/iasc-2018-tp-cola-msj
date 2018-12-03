const getTopic = require('./getTopic');
const getConsumerById = require('./getConsumerById');

module.exports = (msg, socket, statusManager) => {
  const topic = getTopic(msg.topic, statusManager.topics);
  let consumer = {}, newConsumer = false;

  if (topic) {
    consumer = getConsumerById(msg.idConsumer, topic.consumers);

    if (!consumer) {
      consumer = {
        id: msg.idConsumer !== null ? msg.idConsumer : statusManager.idsConsumers++,
      };
      newConsumer = true;
    }

    consumer.working = false;

    if (topic.tipoCola == 'publicar_suscribir') {
      process.send({ tipo: "createQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id });
      socket.on('disconnect', () => {
        process.send({ tipo: "deleteQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id });
      });
    }

    if (newConsumer) {
      console.log(`Voy a insertar consumer ${newConsumer}`);
      topic.consumers.push(consumer);
    }
    socket.emit('status_topic', { success: true, idConsumer: consumer.id });
  } else {
    socket.emit('status_topic', { success: false, message: "No existe el topic " + msg.topic });
  }

  return consumer.id;
};
