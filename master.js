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
        this.consumerRecibeMensajes(topic, { tipo, topic, tipoCola, idConsumer, msg });
        break;
      case "removeConsumer":
        this.removeConsumer(topic, msg);
        break;
      default:
        throw new Error("Invalid message type.");
    }
  };

  createQueue(topic, tipo, consumidor) {
    const { nodo, replica } = new Queue(this.nodo, topic);
    console.log(`Queue creada: ${topic} nodo queue: ${nodo.pid}`);
    nodo.send({ tipo: "consumer", consumidor });
    this.queues.push({ topic, nodo, replica });
  }

  deleteQueue(topic, tipoCola, consumidor) {
    if (tipoCola == "publicar_suscribir") {
      this.queues.forEach(q => q.topic == topic && q.nodo.send({ tipo: "delete", consumidor }));
      //this.queues.forEach(q => q.topic == topic && q.nodo.disconnect());
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
  constructor(manager, topic) {
    this.topic = topic
    this.manager = manager;
    this.nodo = fork("nodo_queue.js");
    this.replica = null;
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    this.nodo.on('close', (code) => {console.log("close"); });
    this.nodo.on('error', (err) => {});
    //this.replica.on('message', this.handleMessage);
  }

  handleMessage({ tipo, topic, mensaje, idConsumer }) {
    switch (tipo) {
      case "FULL":
        this.manager.send({ topic: this.topic, msg: tipo });
      case "enviarMensaje":
        this.manager.send({ topic: this.topic, tipo, mensaje, idConsumer });
        break;
      default:
        throw new Error("Invalid message type.");
    }
  }
}

new Manager();