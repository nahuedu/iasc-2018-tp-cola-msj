const minimist = require('minimist');
const http = require('http');
const conn = require('../utils/Connections');

const port = conn.producerPort;
const hostname = conn.host;

const argv = minimist(process.argv);
const { topic, msg } = argv;

if (!topic || !msg) {
    console.log('Usage: node enviar_mensajes.js --topic TOPIC --msg MSG');
    process.exit();
}

console.log(topic, msg);

console.log(`Se enviara un mensaje haciendo POST a ${hostname}:${port}/send`);

const postData = {
    topic,
    msg
};

const options = {
    hostname,
    port,
    path: '/send',
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
