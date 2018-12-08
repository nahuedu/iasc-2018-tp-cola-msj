const { fork } = require('child_process');

class Manager {
  constructor(original) {
    this.original = original;
    this.queues = [];
    this.queueCounter = 0;
    this.nodo = fork("nodo_manager.js");
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    this.nodo.send({ tipo: "init", original: original });
    this.nodo.on('close', code => {
      console.log("close with code", code);
      if (code == null) {
        console.log(`Manager was killed. Original: ${this.original}`);
        managerKilled(this.original);
      }
    });
  }

  handleMessage({ tipo, topic, tipoCola, idConsumer, msg, status }) {
    switch (tipo) {
      case "createQueue":
        this.createQueue(topic, tipoCola, idConsumer);
        break;
      case "deleteQueue":
        this.deleteQueue(topic, tipoCola, idConsumer);
        break;
      case "sendMsg":
        this.enviarComoViene(topic, { tipo, topic, tipoCola, idConsumer, msg });
        break;
      case "consumerRecibeMensajes":
        this.enviarComoViene(topic, { tipo, topic, tipoCola, idConsumer, msg });
        break;
      case "removeConsumer":
        this.enviarComoViene(topic, msg);
        break;
      case "toReplica":
        this.toReplica({ tipo, status: status });
        break;
    }
  };

  createQueue(topic, tipoCola, consumidor) {
    const idQueue = ++this.queueCounter;
    const queue = new Queue(this, topic, idQueue, true, consumidor);
    queue.nodo.send({ tipo: "init", consumidor, original: true , tipoCola, topic});

    const queueReplica = new Queue(this, topic, idQueue, false, consumidor);
    queueReplica.nodo.send({ tipo: "init", consumidor, original: false , tipoCola, topic});

    console.log(`Queue creada: ${topic} nodo queue: ${queue.nodo.pid} nodo replica: ${queueReplica.nodo.pid}`);
    this.queues.push({ idQueue, topic, original: queue, replica: queueReplica });
  }

  deleteQueue(topic, tipoCola, consumidor) {
    if (tipoCola === "publicar_suscribir") {
      this.queues.forEach(q => q.topic === topic && q.original.nodo.send({ tipo: "delete", consumidor }) && q.replica.nodo.send({ tipo: "delete", consumidor }));
      //this.queues.forEach(q => q.topic == topic && q.nodo.disconnect());
    }
  }

  enviarComoViene(topic, msg) {
    for (var i = 0; i < this.queues.length; i++) {
      if (this.queues[i].topic === topic)
        this.queues[i].original.nodo.send(msg)
    }
  }

  toReplica(msg) {
    managerReplica.nodo.send(msg)
  }

  nodoReplica(idQueue) {
    const element = this.queues.find(q => q.idQueue === idQueue);
    return element.replica
  }

  queueKilled(idQueue, original, consumidor) {
    const element = this.queues.find(q => q.idQueue === idQueue);

    const replica = new Queue(this, element.topic, idQueue, false, consumidor);
    replica.nodo.send({ tipo: "init", consumidor, original: false });

    console.log(original);
    if (original) {
      element.original = element.replica;
      element.original.nodo.send({ tipo: "init", consumidor, original: true });
    }

    console.log("Replica reemplazada");
    element.replica = replica;
  }
}

class Queue {
  constructor(manager, topic, idQueue, original, consumidor) {
    this.idQueue = idQueue;
    this.topic = topic;
    this.manager = manager;
    this.original = original;
    this.nodo = fork("nodo_queue.js");
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    this.nodo.on('close', (code) => {
      console.log("close with code", code);
      if (code == null) {
        console.log("Queue " + this.idQueue + " was killed. Original: " + this.original);
        this.manager.queueKilled(this.idQueue, this.original, consumidor)
      }
    });
    this.nodo.on('error', () => { });
  }

  handleMessage({ tipo, topic, mensaje, idConsumer, status }) {
    switch (tipo) {
      case "FULL":
      case "AVAILABLE":
        this.manager.nodo.send({ topic: this.topic, msg: tipo });
        break;
      case "enviarMensaje":
        this.manager.nodo.send({ topic: this.topic, tipo, mensaje, idConsumer });
        break;
      case "toReplica":
        const replica = this.manager.nodoReplica(this.idQueue);
        if (replica)
          replica.nodo.send({ tipo, status });
        break;
      case "soyOriginal":
        this.original = true;
        break;
      default:
        console.log({ tipo, topic, mensaje, idConsumer }, "mensaje error handle manager");
        throw new Error("Invalid message type.");
    }
  }
}

let managerOriginal = new Manager(true);
let managerReplica = new Manager(false);

function managerKilled(original) {
  if (original) {
    managerReplica.queues = managerOriginal.queues;
    managerReplica.queues.forEach((q) => {
      q.original.manager = managerReplica;
      q.replica.manager = managerReplica
    });

    managerOriginal = managerReplica;
    managerOriginal.original = true;
    managerOriginal.nodo.send({ tipo: "init", original: true });
  }

  managerReplica = new Manager(false);

  console.log(`Original ${managerOriginal.nodo.pid}`);
  console.log(`Replica ${managerReplica.nodo.pid}`);
}