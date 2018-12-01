const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Se creara una cola haciendo POST a http://localhost:9000/queue');

rl.question('Ingrese topic: ', (topic) => {

    rl.question('Ingrese tipo de cola, debe ser cola_de_trabajo o publicar_suscribir: ', (tipoCola) => {
       
        const postData = {
            topic: topic,
            tipoCola: tipoCola
        };

        const options = {
            hostname: 'localhost',
            port: 9000,
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