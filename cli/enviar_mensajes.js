const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Se enviara un mensaje haciendo POST a http://localhost:9000/send');

rl.question('Ingrese topic: ', (topic) => {

    rl.question('Ingrese el mensaje: ', (mensaje) => {
       
        const postData = {
            topic: topic,
            msg: mensaje
        };

        const options = {
            hostname: 'localhost',
            port: 9000,
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