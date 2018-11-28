const io = require('socket.io-client');
const config = require('config');
const socket = io(config.get('master.host'));
const sleep = require('sleep');

const topic = config.get('consumer.topic');

socket.on('connect', () => {
  socket.emit('conectar_topic', { topic });
});

socket.on('status_topic', msg => {
  console.log(msg);
});

socket.on('mensaje', msg => {
  console.log(msg.mensaje);
  sleep.sleep(5);
  socket.emit('working', { topic, working: false });
});