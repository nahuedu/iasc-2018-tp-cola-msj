const readline = require('readline');
const http = require('http');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var puerto = conn.producerPort;
var host = conn.host;

console.log(`Se creara una cola haciendo POST a ${host}:${puerto}/queue`);

rl.question('Ingrese topic: ', (topic) => {

    rl.question('Ingrese tipo de cola, debe ser cola_de_trabajo o publicar_suscribir: ', (tipoCola) => {
       
        const postData = {
            topic: topic,
            tipoCola: tipoCola
        };

        const options = {
            hostname: host,
            port: puerto,
            path: '/queue',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
            }
        };
        
        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (data) => {
                console.log(data);
            });
        });

        req.write(JSON.stringify(postData));
        req.end();
        rl.close();
    });
});