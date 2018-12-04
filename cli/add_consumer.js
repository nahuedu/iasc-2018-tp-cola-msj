const Consumer = require('./consumerClientSocket');
const minimist = require('minimist');
const conn = require('../utils/Connections');

const managerUrl = `http://${conn.host}:${conn.consumerPort}`;

const argv = minimist(process.argv);
const { topic } = argv;

if (!topic) {
  console.log('Usage: node add_consumer.js --topic TOPIC');
  process.exit();
}

console.log(`Se conectara un nuevo consumer a ${managerUrl}`);

new Consumer(argv['topic'], managerUrl).socketClient();
