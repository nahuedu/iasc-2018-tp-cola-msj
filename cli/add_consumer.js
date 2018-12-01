const readline = require('readline');
const config = require('config');
const Consumer = require('../consumer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var managerUrl = config.get('manager.consumers');

console.log(`Se conectara un nuevo consumer a ${managerUrl}`);

rl.question('Ingrese topic: ', (topic) => {

    new Consumer(topic, managerUrl).socketClient();

    
});