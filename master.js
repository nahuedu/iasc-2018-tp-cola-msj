const { fork } = require('child_process');

class Manager {
  constructor() {
    this.queues = [];
    this.nodo = fork("nodo_manager.js");
    this.replica = null;
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    //this.replica.on('message', this.handleMessage);
  }

  handleMessage({ tipo, topic, tipoCola, idConsumer, msg }) {
    switch (tipo) {
      case "createQueue":
        this.createQueue(topic, tipoCola, idConsumer);
        break;
      case "deleteQueue":
        this.deleteQueue(topic, tipoCola, idConsumer);
        break;
      case "sendMsg":
        this.sendMsg(topic, msg);
        break;
      case "consumerRecibeMensajes":
        this.consumerRecibeMensajes(topic, msg);
        break;
      case "removeConsumer":
        this.removeConsumer(topic, msg);
        break;
      default:
        throw new Error("Invalid message type.");
    }
  };

  createQueue(topic, tipo, consumidor) {
    const { nodo, replica } = new Queue(this.nodo);
    console.log(`Queue creada: ${topic} nodo queue: ${nodo.pid}`);
    nodo.send({ tipo: "consumer", consumidor });
    this.queues.push({ topic, nodo, replica });
  }

  deleteQueue(topic, tipo, consumidor) {
    if (tipoCola == "publicar_suscribir") {
      queues.forEach(q => q.topic == topic && q.nodo.send({ tipo: "delete", consumidor }));
    };
  }

  sendMsg(topic, msg) {
    this.queues.forEach(q => q.topic == topic && q.nodo.send(msg));
  }

  consumerRecibeMensajes(topic, msg) {
    this.queues.forEach(q => q.topic == topic && q.nodo.send(msg));
  }

  removeConsumer(topic, msg) {
    this.queues.forEach(q => q.topic == topic && q.nodo.send(msg));
  }
}

class Queue {
  constructor(manager) {
    this.manager = manager;
    this.nodo = fork("nodo_queue.js");
    this.replica = null;
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    //this.replica.on('message', this.handleMessage);
  }

  handleMessage({ tipo, topic, mensaje, idConsumer }) {
    switch (tipo) {
      case "FULL":
        this.manager.send({ topic, msg: tipo });
      case "enviarMensaje":
        this.manager.send({ topic, tipo, mensaje, idConsumer });
        break;
      default:
        throw new Error("Invalid message type.");
    }
  }
}

new Manager();