const readline = require('readline');
const ConsumerClientSocket = require('./consumerClientSocket');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var managerUrl = `http://${conn.host}:${conn.consumerPort}`;

console.log(`Se conectara un nuevo consumer a ${managerUrl}`);

rl.question('Ingrese topic: ', (topicTitle) => {

    new ConsumerClientSocket(topicTitle, managerUrl).socketClient();
    
});