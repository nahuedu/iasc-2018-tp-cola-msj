const readline = require('readline');
const http = require('http');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var puerto = conn.producerPort;
var host = conn.host;

console.log(`Se enviara un mensaje haciendo POST a ${host}:${puerto}/send`);

rl.question('Ingrese topic: ', (topicTitle) => {

    rl.question('Ingrese el mensaje: ', (mensaje) => {
       
        const postData = {
            topicTitle: topicTitle,
            msg: mensaje
        };

        const options = {
            hostname: host,
            port: puerto,
            path: '/send',
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