const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const newConsumer = require('./utils/newConsumer');
const getTopic = require('./utils/getTopic');
io.origins('*:*');

const puerto = 9000;

const statusManager = {
  topics: [],
  idsConsumers: 0
};

/* SOCKET PARA QUE LOS CONSUMIDORES SE CONECTEN */
io.on('connection', (socket) => {
  let idConsumer;
  console.log(`connected: `, socket.id);
  socket.on('conectar_topic', (msg) => {
    idConsumer = newConsumer(msg, socket, statusManager)
  });

  socket.on('working', (msg) => {
    const topic = getTopic(msg.topic, statusManager.topics);
    topic.consumers.forEach((c) => {
      if (c.id === idConsumer) {
        c.working = msg.working
      }
    })
  });

  socket.on('disconnect', () => {
    console.log(`disconnected: ${idConsumer}`);
    process.send({tipo: 'removeConsumer', consumer: idConsumer});
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
/* FIN SOCKET */

/* HTTP REST PARA PRODUCTORES */
app.listen(puerto, () => {
  console.log('nodo manager corriendo en el puerto 9000');
});

app.get('/send', (req, res) => {
  console.log(`req: `, req.query);
  const msg = req.query.msg;
  const topic = req.query.topic;
  console.log(`recibí: ${msg} al topico: ${topic}`);
  const existentTopic = getTopic(topic, statusManager.topics);
  console.log('existent topic: ', existentTopic);
  if (existentTopic != null) {
    if (!existentTopic.lleno) {
      process.send({tipo: 'sendMsg', topic: topic, msg: msg});
      res.json({success: true, msg: 'Mensaje recibido'});
    }
    else {
      res.status(400).json({success: false, msg: 'La cola con topico ' + topic + ' esta llena'});
    }
  }
  else {
    res.status(404).json({success: false, msg: 'Topic no encontrado'});
  }

});

app.get('/newQueue', function (req, res) {
  const topic = req.query.topic;
  const tipoCola = req.query.tipoCola;

  if (getTopic(topic, statusManager.topics) == null) {
    if (tipoCola === 'cola_de_trabajo'){
      process.send({tipo: 'createQueue', topic: topic, tipoCola: tipoCola, idsConsumer: null});
    }

    statusManager.topics.push({
      topic: topic,
      tipoCola: tipoCola,
      lleno: false,
      consumers: [],
    });

    res.send({success: true, msg: 'Cola creada con el topic ' + topic});
  }
  else {
    res.send({success: false, msg: 'El topic ' + topic + ' ya existe'});
  }
});

/* FIN HTTP REST PARA PRODUCTORES */

process.on('message', (msg) => {
  if (msg.msg === 'FULL') {
    let topic = getTopic(msg.topic, statusManager.topics);
    topic.lleno = true
  }
  else if (msg.msg === 'AVAILABLE') {
    let topic = getTopic(msg.topic, statusManager.topics);
    topic.lleno = false
  } else if (msg.tipo === 'enviarMensaje') {
    const topic = getTopic(msg.topic, statusManager.topics);
    if (typeof msg.idConsumer !== 'number') {
      topic.consumers.forEach((c) => {
        if (!c.working) {
          c.socket.emit('mensaje', {mensaje: msg.mensaje});
          c.working = true;
        }
      })
    } else {
      topic.consumers.forEach((c) => {
        if (!c.working) {
          c.socket.emit('mensaje', {mensaje: msg.mensaje});
          c.working = true
        }
      })
    }
  }
});

/* LOOP REPARTE MENSAJES */
setInterval(() => {
  statusManager.topics.forEach((topic) => {
    topic.consumers.forEach((consumer) => {
      if (!consumer.working) {
        process.send({tipo: 'consumerRecibeMensajes', topic: topic.topic, idConsumer: consumer.id});
      }
    })
  })
}, 10);
/* FIN LOOP */
