const readline = require('readline');
const config = require('config');
const Consumer = require('../consumer');
const conn = require('../utils/Connections');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var topic,transactional;

var managerUrl = `http://${conn.host}:${conn.consumerPort}`;

console.log(`Se conectara un nuevo consumer a ${managerUrl}`);

rl.question('Ingrese topic: ', (topicAnswer) => {
  topic = topicAnswer;
  rl.question('Consumo transaccional? (y/n): ', (answer) => {
    transactional = answer.toUpperCase() === 'Y' ? true : false;
    new Consumer(topic, managerUrl,transactional).socketClient();  
  });
});



