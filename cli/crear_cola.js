const http = require('http');
const minimist = require('minimist');
const conn = require('../utils/Connections');

const port = conn.producerPort;
const hostname = conn.host;

const argv = minimist(process.argv);
const { topic, tipoCola } = argv;


if (!topic || !['cola_de_trabajo', 'publicar_suscribir'].includes(tipoCola)) {
    console.log('Usage: node crear_cola.js --topic TOPIC --tipoCola [cola_de_trabajo|publicar_suscribir]');
    process.exit();
}

console.log(`Se creara una cola haciendo POST a ${hostname}:${port}/queue`);

const postData = {
    topic,
    tipoCola
};

const options = {
    hostname,
    port,
    path: '/queue',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache'
    }
};

const req = http.request(options, res => {
    res.setEncoding('utf8');
    res.on('data', console.log);
});

req.write(JSON.stringify(postData));
req.end();
