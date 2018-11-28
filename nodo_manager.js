const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const newConsumer = require('./utils/newConsumer');
const getTopic = require('./utils/getTopic');
io.origins('*:*');

const puerto = 9000;

var statusManager = {
  topics: [],
  idsConsumers: 0, 
  original: false,
  initOriginal: true,
};


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

        /* SOCKET PARA QUE LOS CONSUMIDORES SE CONECTEN */
        io.on('connection', socket => {
          let idConsumer;
          console.log(`connected: ${socket.id}`);
          socket.on('conectar_topic', msg => {
            idConsumer = newConsumer(msg, socket, statusManager);
          });

          socket.on('working', msg => {
            const topic = getTopic(msg.topic, statusManager.topics);
            topic && topic.consumers.forEach(c => {
              if (c.id == idConsumer) {
                c.working = msg.working
              }
            });
          });

          socket.on('disconnect', () => {
            console.log(`disconnected: ${idConsumer}`);
            process.send({ tipo: 'removeConsumer', consumer: idConsumer });
          })
        });

        app.use(bodyParser.json()); // for parsing application/json

        http.listen(3000, () => {
          console.log('listening on *:3000');
        });
        /* FIN SOCKET */

        /* HTTP REST PARA PRODUCTORES */
        app.listen(puerto, () => {
          console.log('nodo manager corriendo en el puerto 9000');
        });

        app.post('/send', (req, res) => {
          const { msg, topic } = req.body,
            existentTopic = getTopic(topic, statusManager.topics);
          console.log(`req: ${req.body}\nrecibí: ${msg} al topico: ${topic}\nexistent topic: ${existentTopic}`);
          if (existentTopic) {
            if (existentTopic.lleno) {
              res.status(400).json({ success: false, msg: 'La cola con topico ' + topic + ' esta llena' });
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

          if (!getTopic(topic, statusManager.topics)) {
            if (tipoCola == 'cola_de_trabajo') {
              process.send({ tipo: 'createQueue', topic, tipoCola, idConsumer: null });
            }

            statusManager.topics.push({
              topic,
              tipoCola,
              lleno: false,
              consumers: [],
            });

            res.send({ success: true, msg: 'Cola creada con el topic ' + topic });
          }
          else {
            res.send({ success: false, msg: 'El topic ' + topic + ' ya existe' });
          }
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
    let topic = getTopic(msg.topic, statusManager.topics);
    topic.lleno = true;
  }
  else if (msg.msg == 'AVAILABLE') {
    let topic = getTopic(msg.topic, statusManager.topics);
    topic.lleno = false;
  } else if (msg.tipo == 'enviarMensaje') {
    const topic = getTopic(msg.topic, statusManager.topics);
    if (typeof msg.idConsumer !== 'number') {
      topic.consumers.forEach((c) => {
        if (!c.working) {
          c.socket.emit('mensaje', { mensaje: msg.mensaje });
          c.working = true;
        }
      })
    } else {
      topic.consumers.forEach(c => {
        if (!c.working && c.id == msg.idConsumer) {
          c.socket.emit('mensaje', { mensaje: msg.mensaje });
          c.working = true
        }
      })
    }
  }
}

function handleMessageReplica(msg) {
  switch(msg.tipo) {
    case "init":
      console.log(msg)
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
  if (statusManager.original){
      process.send({tipo: "toReplica", status: statusManager })  
    }
}, 1000);