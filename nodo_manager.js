const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const newConsumer = require('./utils/newConsumer');
const getSocket = require('./utils/getSocket');
const conn = require('./utils/Connections');
io.origins('*:*');

const sockets = [];

let statusManager = {
  topics: new Map(),
  idsConsumers: 1,
  original: false,
  initOriginal: true,
};

process.on('message', msg => {
  if (statusManager.original) {
    handleMessageOriginal(msg);
  } else {
    handleMessageReplica(msg);
  }
});

setInterval(() => {
  if (statusManager.original && statusManager.initOriginal) {
    statusManager.initOriginal = false;
    console.log(`Soy el nuevo manager original ${process.pid}`);
    /* SOCKET PARA QUE LOS CONSUMIDORES SE CONECTEN */
    io.on('connection', socket => {
      let idConsumer;
      console.log(`connected: ${socket.id}`);
      socket.on('conectar_topic', msg => {
        idConsumer = newConsumer(msg, socket, statusManager);
        sockets.push({ idConsumer, socket });
      });

      socket.on('working', msg => {

        const topic = statusManager.topics.get(msg.topic);
        if (topic) {
          const c = topic.consumers.get(idConsumer)
          c.working = msg.working;
        }

      });

      socket.on('disconnect', () => {
        console.log(`disconnected: ${idConsumer}`);
        process.send({ tipo: 'removeConsumer', consumer: idConsumer });
      })
    });

    app.use(bodyParser.json()); // for parsing application/json

    http.listen({ host: conn.host, port: conn.consumerPort }, () => {
      console.log(`Recibiendo conexiones de consumidores en ${conn.host}:${conn.consumerPort}`);
    });
    /* FIN SOCKET */

    /* HTTP REST PARA PRODUCTORES */
    app.listen({ host: conn.host, port: conn.producerPort }, () => {
      console.log(`Recibiendo conexiones de productores en ${conn.host}:${conn.producerPort}`);
    });

    app.post('/send', (req, res) => {
      const { msg, topic } = req.body,
        existentTopic = statusManager.topics.get(topic);
      //          console.log(`req: ${req.body}\nrecibí: ${msg} al topico: ${topic}\nexistent topic: ${existentTopic}`);
      if (existentTopic) {
        if (existentTopic.lleno) {
          res.status(400).json({ success: false, msg: `La cola con topico ${topic} esta llena` });
        } else {
          process.send({ tipo: 'sendMsg', topic: topic, msg: msg });
          res.json({ success: true, msg: 'Mensaje recibido' });
        }
      } else {
        res.status(404).json({ success: false, msg: 'Topic no encontrado' });
      }
    });

    app.post('/queue', (req, res) => {
      const { topic, tipoCola } = req.body;

      if (!statusManager.topics.get(topic)) {
        if (tipoCola === 'cola_de_trabajo') {
          process.send({ tipo: 'createQueue', topic, tipoCola, idConsumer: null });
        }

        statusManager.topics.set(topic, {
          topic,
          tipoCola,
          lleno: false,
          consumers: new Map(),
        });

        res.send({ success: true, msg: `Cola creada con el topic ${topic}` });
      }
      else {
        res.send({ success: false, msg: `El topic ${topic} ya existe` });
      }
    });

    app.get('/status', (req, res) => {
      res.send(statusManager);
    });

    /* FIN HTTP REST PARA PRODUCTORES */

    /* LOOP REPARTE MENSAJES */
    setInterval(() => {
      statusManager.topics.forEach(topic => {
        topic.consumers.forEach(consumer => {
          if (!consumer.working) {
            process.send({ tipo: 'consumerRecibeMensajes', topic: topic.topic, idConsumer: consumer.id });
          }
        })
      })
    }, 1000);
    /* FIN LOOP */
  }
}, 1000);

function handleMessageOriginal(msg) {
  const topic = statusManager.topics.get(msg.topic);
  if (msg.tipo === "init") {
    console.log(msg);
    statusManager.original = msg.original;
  }
  else if (msg.msg === 'FULL') {
    topic.lleno = true;
  }
  else if (msg.msg === 'AVAILABLE') {
    topic.lleno = false;
  } else if (msg.tipo === 'enviarMensaje') {
    console.log(`recibo mensaje: `, msg);
    if (typeof msg.idConsumer !== 'number') {
      console.log(`socket: ${msg.idConsumer}`);
      const consumers = Array.from(topic.consumers.values());
      for (let i = 0; i < consumers.length; i++) {
        const c = consumers[i];

        if (!c.working) {
          c.working = true;
          let socket = getSocket(c.id, sockets).socket;
          
          if (socket){
            socket.emit('mensaje', { mensaje: msg.mensaje });
          }
          else {
            console.log("No encuentro socket para enviar mensaje", msg)
          }
          break;
       /*   setTimeout(() => {
            //si a los 10 segundos no confirmo accion, reencolar
          }, 10000);
          */
        }
      }
    } else {
      console.log(`consumers: `, topic.consumers.values());
      const consumerDefault = topic.consumers.get(0);
      if (consumerDefault) {
        console.log("ENVIAR", consumerDefault, msg);
      } else {
        const consumer = topic.consumers.get(msg.idConsumer);
        if (consumer && !consumer.working) {
          if (consumer.id === 0)  console.log("ENTRE", consumer);
          consumer.working = true;
          const { socket } = getSocket(consumer.id, sockets);
          if (consumer.id === 0)  console.log("Voy a enviar", msg.mensaje);
          socket.emit('mensaje', { mensaje: msg.mensaje });
        }
      }
    }
  }
}

function handleMessageReplica(msg) {
  switch (msg.tipo) {
    case "init":
      console.log(`Creo manager ${process.pid}`);
      statusManager.original = msg.original;
      break;
    case 'toReplica':
      statusManager = msg.status;
      statusManager.original = false;
      statusManager.initOriginal = true;
      break;
  }
}

setInterval(() => {
  if (statusManager.original) {
    process.send({ tipo: "toReplica", status: statusManager });
  }
}, 1000);