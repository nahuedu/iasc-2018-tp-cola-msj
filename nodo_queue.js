let MAXIMO = 1000;
const uuidv1 = require('uuid/v1');
let statusQueue = {
  mensajes: [],
  consumidores: [],
  original: false,
};

const STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
};

process.on('message', msg => {
  if (statusQueue.original === true) {
    handleMessageOriginal(msg)
  } else {
    handleMessageReplica(msg)
  }
});


function handleMessageOriginal(msg) {
  switch (msg.tipo) {
    case "delete":
      deleteQueue(msg);
      break;
    case 'consumerRecibeMensajes':
      deliverToConsumer(msg.tipoCola);
      break;
    case 'sendMsg':
      statusQueue.mensajes.push({
        id: uuidv1(), 
        message: msg.msg,
        status: STATUS.PENDING
      });
      console.log(`Soy queue ${process.pid}: del tipo: ${msg.tipoCola} Sumo mensaje: Tengo `, statusQueue.mensajes.length);
      if (statusQueue.mensajes.length >= MAXIMO) {
        process.send({tipo: 'FULL'})
      }
      break;
    case "removeConsumer":
      removeConsumer(msg.idConsumer);
      break;
    case "addConsumer":
      console.log(`agregado consumer con id ${msg.idConsumer}`);

      statusQueue.consumidores.push(msg.idConsumer);
      break;
    default:
      console.log(msg)
  }
}

function removeConsumer(idConsumer) { //Este mensaje lo reciben las colas de trabajo
  statusQueue.consumidores = statusQueue.consumidores.filter(c => c !== idConsumer);
}

function handleMessageReplica(msg) {
  switch (msg.tipo) {
    case "delete":
      deleteQueue(msg.idConsumer);
      break;
    case 'init':
      statusQueue.original = msg.original;
      process.send({tipo: "soyOriginal"});
      console.log("Soy queue " + process.pid + ": Mi consumidor es " + statusQueue.consumidores + ' y original es ' + statusQueue.original);
      break;
    case 'toReplica':
      statusQueue = msg.status;
      statusQueue.original = false;
      break;
  }
}

function deliverToConsumer(tipoCola) {
  if (statusQueue.mensajes.length > 0) {
    console.log(`TIPO COLA: ${tipoCola}`);
    const consumerQueRecibe = statusQueue.consumidores.shift();
    statusQueue.consumidores.push(consumerQueRecibe);
    const mensaje = statusQueue.mensajes.find((m) => m.status === STATUS.PENDING);
    setTimeout(() => {
      var unprocessMessageInd = statusQueue.mensajes.findIndex((m) => m.id === mensaje.id);
      if(unprocessMessageInd != -1 ){
        statusQueue.mensajes[unprocessMessageInd].status = STATUS.PENDING;
      }
    },10000);
    console.log(`Soy queue ${process.pid}: Resto mensaje: Tengo `, statusQueue.mensajes.length);
    process.send({tipo: 'enviarMensaje', mensaje, idConsumer: consumerQueRecibe})
  }

  if (statusQueue.mensajes.length < MAXIMO) {
    process.send({tipo: 'AVAILABLE'})
  }
}

function deleteQueue(msg) { //Este mensaje se usa solo para colas pub-sub
  if (statusQueue.consumidores[0].id === msg.consumidor) { //Siempre va a tener un solo consumidor
    console.log("Soy queue " + process.pid + ": Me debo eliminar");
    process.disconnect();
    process.exit()
  }
}


setInterval(() => {
  if (statusQueue.original) {
    process.send({tipo: "toReplica", status: statusQueue})
  }
}, 10);

/*
setInterval(() => {
	if (statusQueue.original){
			console.log("Soy queue y mi status es:", statusQueue)
		}
}, 5000);

*/