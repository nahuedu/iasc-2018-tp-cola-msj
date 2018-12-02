const readline = require('readline');
const config = require('config');
const Consumer = require('../consumer');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var managerUrl = `http://${conn.host}:${conn.consumerPort}`;

console.log(`Se conectara un nuevo consumer a ${managerUrl}`);

rl.question('Ingrese topic: ', (topic) => {

    new Consumer(topic, managerUrl).socketClient();
    
});