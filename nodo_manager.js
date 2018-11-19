var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const newConsumer = require('./utils/newConsumer');
const getTopic = require('./utils/getTopic');
io.origins('*:*') 

var puerto = 9000

var statusManager = {
    topics: [],
    idsConsumers: 0
}

/* SOCKET PARA QUE LOS CONSUMIDORES SE CONECTEN */
io.on('connection', function(socket){
    var idConsumer 
  socket.on('conectar_topic', function(msg){
    idConsumer = newConsumer(msg, socket, statusManager)
  })

  socket.on('working', function(msg){
    var topic = getTopic(msg.topic, statusManager.topics)
    topic.consumers.forEach( (c) => {
        if (c.id == idConsumer) {
            c.working = msg.working
       }
   })
    
  })
  
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});
/* FIN SOCKET */

/* HTTP REST PARA PRODUCTORES */
app.listen(puerto, function(){
    console.log('nodo manager corriendo en el puerto 9000');
});


app.get('/send', function (req, res) {
	var msg = req.query.msg;
	var topic = req.query.topic;

    if (getTopic(topic, statusManager.topics) != null) {
        var topicObj = getTopic(topic, statusManager.topics)
        if (!topicObj.lleno){
            process.send({tipo: "sendMsg", topic: topic, msg: msg})
            res.send({success: true, msg: 'Mensaje recibido'});
        }
        else {
            res.send({success: true, msg: 'La cola con topico '+topic+ ' esta llena'});   
        }
    }
    else {
        res.send({success: false, msg: 'Topic no encontrado'});
    }
    
});

app.get('/newQueue', function (req, res) {
    var topic = req.query.topic;
    var tipoCola = req.query.tipoCola;

    if (getTopic(topic, statusManager.topics) == null) {
        
        if (tipoCola == 'cola_de_trabajo')
            process.send({tipo: "createQueue", topic: topic, tipoCola: tipoCola, idsConsumer: null})
        
        statusManager.topics.push( {
            topic: topic, 
            tipoCola: tipoCola, 
            lleno: false, 
            consumers: [],
        })

        res.send({success: true, msg: 'Cola creada con el topic '+topic});
    }
    else {
        res.send({success: false, msg: 'El topic '+topic+' ya existe'});   
    }
});

/* FIN HTTP REST PARA PRODUCTORES */

process.on('message', (msg) => {
    if (msg.msg == "FULL") {
        var topic = getTopic(msg.topic, statusManager.topics)
        topic.lleno = true
    }
    else if (msg.msg == "AVAILABLE") {
        var topic = getTopic(msg.topic, statusManager.topics)
        topic.lleno = false
    } else if (msg.tipo == "enviarMensaje") {
          msg.mensaje
        var topic = getTopic(msg.topic, statusManager.topics) 
        if (typeof msg.idConsumer != "number") {
            topic.consumers.forEach( (c) => {
                if (!c.working) {
                    c.socket.emit('mensaje', { mensaje: msg.mensaje })
                    c.working = true
                    return
                } 
            })   
        } else {
            topic.consumers.forEach( (c) => {
                if (!c.working) {
                    c.socket.emit('mensaje', { mensaje: msg.mensaje })
                    c.working = true
                } 
            })   
        }


    }
})


/* LOOP REPARTE MENSAJES */

setInterval( () => {
    statusManager.topics.forEach( (topic) => {
        topic.consumers.forEach( (consumer) => {
            if (!consumer.working) {
                process.send({tipo: "consumerRecibeMensajes", topic: topic.topic, idConsumer: consumer.id })
                return;
            }
        })
    })
}, 10)

/* FIN LOOP */
