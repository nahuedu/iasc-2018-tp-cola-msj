const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Worker processes have a http server.
  http.Server((req, res) => {
    res.writeHead(200);
    res.end('OK\n');
    for (const id in cluster.workers) {
        cluster.workers[id].send('Hola workers!');
    }
  }).listen(8000);

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', function(msg){
        console.log(`Master received: ${msg} `);
    });
  }

} else {

    console.log(`Worker ${process.pid} started`);
    process.on('message', (msg) => {
        console.log(`Worker received: ${msg} `);
        process.send('Hola Master!');
    });
  
}