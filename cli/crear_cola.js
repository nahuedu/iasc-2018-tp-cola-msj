const readline = require('readline');
const http = require('http');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const port = conn.producerPort;
const hostname = conn.host;

console.log(`Se creara una cola haciendo POST a ${hostname}:${port}/queue`);

rl.question('Ingrese topic: ', topic => {

    rl.question('Ingrese tipo de cola, debe ser cola_de_trabajo o publicar_suscribir: ', tipoCola => {

        if (!['cola_de_trabajo', 'publicar_suscribir'].includes(tipoCola)) {
            console.error(`Tipo de cola inválido: ${tipoCola}`);
            process.exit();
        }

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
        rl.close();
    });
});