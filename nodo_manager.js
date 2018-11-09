var express = require('express');
var app = express();

var puerto = 9000;


app.listen(puerto, function(){
    console.log('nodo manager corriendo en el puerto 9000');
});


app.get('/send', function (req, res) {
    console.log('recibido el mensaje: ' + req.query.msj);
    res.send('mensaje recibido');
});