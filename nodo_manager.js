var express = require('express');
var app = express();

var puerto = 9000;
var topics = []

app.listen(puerto, function(){
	process.send("Estoy escuchando master")
    console.log('nodo manager corriendo en el puerto 9000');
});

app.get('/send', function (req, res) {
	var msg = req.query.msg;
	var topic = req.query.topic;

    if (getTopic(topic) != null) {
        var topicObj = getTopic(topic)
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

    if (getTopic(topic) == null) {
        process.send({tipo: "createQueue", topic: topic, tipoCola: tipoCola})
        topics.push({topic: topic, tipoCola: tipoCola, lleno: false})
        res.send({success: true, msg: 'Cola creada con el topic '+topic});
    }
    else {
        res.send({success: false, msg: 'El topic '+topic+' ya existe'});   
    }
});



process.on('message', (msg) => {
    if (msg.msg == "FULL") {
        var topic = getTopic(msg.topic)
        topic.lleno = true
    }
    else if (msg.msg == "AVAILABLE") {
        var topic = getTopic(msg.topic)
        topic.lleno = false
    }
})



function getTopic(topic) {
    var topicReturn = null
    topics.forEach( (t) => {
        if (topic == t.topic)
            topicReturn = t
    })

    return topicReturn
}