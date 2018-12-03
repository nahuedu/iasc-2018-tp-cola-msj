const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const utils = require('./utils/Utils');
const conn = require('./utils/Connections');
const Topic = require('./entities/Topic');
const Consumer = require('./entities/Consumer');
io.origins('*:*');

var statusManager = {
  topics: [],
  idsConsumers: 0, 
  original: false,
  initOriginal: true,
};
const sockets = [];

process.on('message', msg => {
  if (statusManager.original == true) {
    handleMessageOriginal(msg)
  } else {
    handleMessageReplica(msg)
  }

});


setInterval(() => {
  if (statusManager.original && statusManager.initOriginal) {
    statusManager.initOriginal = false

    console.log("Soy el nuevo manager original -> pid: " + process.pid);
    /* SOCKET PARA QUE LOS CONSUMIDORES SE CONECTEN */
    io.on('connection', socket => {
      console.log(`connected: ${socket.id}`);
      socket.on('conectar_topic', msg => {
        var idConsumer = newConsumer(msg.topicTitle, msg.idConsumer, socket, statusManager);
        sockets.push({ idConsumer, socket });
        process.send({tipo:'addConsumer', idConsumer: idConsumer, topicTitle:msg.topicTitle});
      });
    });

    app.use(bodyParser.json()); // for parsing application/json

    http.listen({ host: conn.host, port: conn.consumerPort }, () => {
      console.log(`recibiendo conexiones de consumidores en ${conn.host}:${conn.consumerPort}`);
    });
    /* FIN SOCKET */

    /* HTTP REST PARA PRODUCTORES */
    app.listen({ host: conn.host, port: conn.producerPort }, () => {
      console.log(`recibiendo conexiones de productores en ${conn.host}:${conn.producerPort}`);
    });

    app.post('/send', (req, res) => {
      const { msg, topicTitle } = req.body;
      const existentTopic = utils.getTopic(topicTitle, statusManager.topics);
      
      if (existentTopic) {
        if (existentTopic.lleno) {
          res.status(400).json({ success: false, msg: 'La cola con topico ' + topicTitle + ' esta llena' });
        } else {
          process.send({ tipo: 'sendMsg', topicTitle, msg });
          res.json({ success: true, msg: 'Mensaje recibido' });
        }
      } else {
        res.status(404).json({ success: false, msg: 'Topic no encontrado' });
      }
    });

    app.post('/queue', (req, res) => {
      const { topicTitle, tipoCola } = req.body;

      if (!utils.getTopic(topicTitle, statusManager.topics)) {
        if (tipoCola == 'cola_de_trabajo') {
          process.send({ tipo: 'createQueue', topicTitle, tipoCola, idConsumer: null });
        }

        statusManager.topics.push(new Topic(topicTitle, tipoCola));

        res.send({ success: true, msg: 'Cola creada con el topic ' + topicTitle });
      }
      else {
        res.send({ success: false, msg: 'El topic ' + topicTitle + ' ya existe' });
      }
    });

    app.get('/status', (req, res) => {
      res.send(statusManager)
    })

    /* FIN HTTP REST PARA PRODUCTORES */

    /* LOOP REPARTE MENSAJES */
    setInterval(() => {
      statusManager.topics.forEach(topic => topic.sendMessages(process))
    }, 10);
    /* FIN LOOP */
  }
}, 1000
);


function handleMessageOriginal(msg) {
  if(msg.tipo == "init") {
      console.log(msg)
      statusManager.original = msg.original
  }
  else if (msg.msg == 'FULL') {
    let topic = utils.getTopic(msg.topicTitle, statusManager.topics);
    topic.llenate();
  }
  else if (msg.msg == 'AVAILABLE') {
    let topic = utils.getTopic(msg.topicTitle, statusManager.topics);
    topic.vaciate();
  } else if (msg.tipo == 'enviarMensaje') {
    const topic = utils.getTopic(msg.topicTitle, statusManager.topics);
    var socket = utils.getConsumerSocket(msg.idConsumer, sockets)
    topic.emitirMensaje(msg, socket);
  }
}

function handleMessageReplica(msg) {
  switch(msg.tipo) {
    case "init":
      console.log("Creo manager "+process.pid);
      statusManager.original = msg.original
      break;
    case 'toReplica':
      statusManager = msg.status
      statusManager.original = false;
      statusManager.initOriginal = true
      break;
  }
  
}



setInterval(() => {
  if (statusManager.original) {
    process.send({ tipo: "toReplica", status: statusManager })
  }
}, 1000);




function newConsumer(topicTitle, idConsumer, socket, statusManager) {

  const topic = utils.getTopic(topicTitle, statusManager.topics);

  if (topic) {
    var consumer = topic.getConsumerById(idConsumer);
    var newConsumer = false;

    if (!consumer) {
      consumer = new Consumer(idConsumer, statusManager, socket, topic);
      newConsumer = true;
    }

    consumer.notWorking();

    if (newConsumer == true) {
      console.log(`Voy a insertar consumer con id ${consumer.id}`);
      topic.addConsumer(consumer);
    }
    socket.emit('status_topic', { success: true , idConsumer: consumer.id});
  } else {
    socket.emit('status_topic', { success: false, message: "No existe el topic " + topicTitle });
  }

  return consumer.id;
};