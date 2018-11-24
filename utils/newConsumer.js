const getTopic = require('./getTopic');

module.exports = (msg, socket, statusManager) => {
  let consumer = {
    id: statusManager.idsConsumers++,
    socket: socket,
    working: false
  };

  const topic = getTopic(msg.topic, statusManager.topics);

  if (topic) {
    if (topic.tipoCola === 'publicar_suscribir') {
      process.send({tipo: "createQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id});
      socket.on('disconnect', () => {
        process.send({tipo: "deleteQueue", topic: topic.topic, tipoCola: topic.tipoCola, idConsumer: consumer.id})
      });
    }

    topic.consumers.push(consumer);
    socket.emit('status_topic', {success: true})
  } else {
    socket.emit('status_topic', {success: false, message: "No existe el topic " + msg.topic})
  }

  return consumer.id;
};