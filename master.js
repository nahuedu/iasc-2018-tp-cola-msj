const {fork} = require('child_process');
let countQueue = 0;

class Manager {
  constructor(original) {
    this.original = original;
    this.queues = [];
    this.nodo = fork("nodo_manager.js");
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    this.nodo.send({tipo: "init", original: original});
    this.nodo.on('close', (code) => {
      console.log('close with code', code);
      if (code == null) {
        console.log(`Manager was killed. Original: ${this.original}`);
        managerKilled(this.original)
      }
    });
  }

  handleMessage({tipo, topicTitle, tipoCola, idConsumer, msg, status}) {
    switch (tipo) {
      case "createQueue":
        this.createQueue(topicTitle, tipoCola);
        break;
      case "deleteQueue":
        this.deleteQueue(topicTitle, tipoCola, idConsumer);
        break;
      case "sendMsg":
        this.sendMsg(topicTitle, {tipo, topicTitle, tipoCola, idConsumer, msg});
        break;
      case "consumerRecibeMensajes":
        this.consumerRecibeMensajes(topicTitle, {tipo, topicTitle, tipoCola, idConsumer, msg});
        break;
      case "removeConsumer":
        this.removeConsumer(tipo, idConsumer, topicTitle);
        break;
      case "toReplica":
        this.toReplica({tipo, status});
        break;
      case "addConsumer":
        this.queues.forEach(q => q.topicTitle === topicTitle && q.original.nodo.send({tipo, idConsumer, topicTitle}));
        break;
    }
  };

  createQueue(topicTitle, tipo) {
    const idQueue = ++countQueue;

    const queue = new Queue(this, topicTitle, idQueue, true, tipo);
    queue.nodo.send({tipo: "init", original: true});

    const queueReplica = new Queue(this, topicTitle, idQueue, false, tipo);
    queueReplica.nodo.send({tipo: "init", original: false});

    console.log(`Queue creada: ${topicTitle} nodo queue: ${queue.nodo.pid} nodo replica: ${queueReplica.nodo.pid}`);
    this.queues.push({idQueue, topicTitle, original: queue, replica: queueReplica});
  }

  deleteQueue(topicTitle, tipoCola, consumidor) {
    const deleteMessage = {
      tipo: "delete",
      consumidor
    };
    if (tipoCola === "publicar_suscribir") {
      this.queues.forEach(q => q.topicTitle === topicTitle && q.original.nodo.send(deleteMessage) && q.replica.nodo.send(deleteMessage));
    } else {
      this.queues.forEach( q => q.topicTitle === topicTitle && q.original.nodo.send(deleteMessage))
    }
  }

  sendMsg(topicTitle, msg) {
    console.log("enviando mensaje",msg);
    console.log(this.queues);
    this.queues.forEach(q => { q.topicTitle === topicTitle; 
                              q.original.nodo.send(msg);
    });
  }

  consumerRecibeMensajes(topicTitle, msg) {
    this.queues.forEach(q => {
      if (q.topicTitle === topicTitle) {
        const message = msg;
        message['tipoCola'] = q.original.tipoCola;
        q.original.nodo.send(message);
      }
    });
  }

  removeConsumer(tipo, idConsumer, topicTitle) {
    this.queues.forEach(q => q.topicTitle === topicTitle && q.original.nodo.send({tipo, idConsumer}));
  }

  toReplica(msg) {
    managerReplica.nodo.send(msg)
  }

  nodoReplica(idQueue) {
    const element = this.queues.find(q => q.idQueue === idQueue);
    return element.replica
  }

  queueKilled(idQueue, original) {
    const element = this.queues.find(q => q.idQueue === idQueue);

    const replica = new Queue(this, element.topicTitle, idQueue, false, original.tipoCola);
    replica.nodo.send({tipo: "init", original: false});

    if (original) {
      console.log("Cayo original, fue reemplazado");
      element.original = element.replica;
      element.original.nodo.send({tipo: "init", original: true});
    }

    console.log("Replica reemplazada");
    element.replica = replica
  }
}

let managerOriginal = new Manager(true);
let managerReplica = new Manager(false);

class Queue {
  constructor(manager, topicTitle, idQueue, original, tipoCola) {
    this.idQueue = idQueue;
    this.topicTitle = topicTitle;
    this.manager = manager;
    this.original = original;
    this.tipoCola = tipoCola;
    this.nodo = fork("nodo_queue.js");
    this.handleMessage = this.handleMessage.bind(this);
    this.nodo.on('message', this.handleMessage);
    this.nodo.on('close', (code) => {
      console.log("close with code", code);
      if (code == null) {
        console.log("Queue " + this.idQueue + " was killed. Original: " + this.original);
        this.manager.queueKilled(this.idQueue, this.original)
      }
    });
    this.nodo.on('error', (err) => {
    });
  }

  handleMessage({tipo, topicTitle, mensaje, idConsumer, status}) {
    switch (tipo) {
      case "FULL":
      case "AVAILABLE":
        this.manager.nodo.send({topicTitle: this.topicTitle, msg: tipo});
        break;
      case "enviarMensaje":
        this.manager.nodo.send({topicTitle: this.topicTitle, tipo, mensaje, idConsumer});
        break;
      case "toReplica":
        const replica = this.manager.nodoReplica(this.idQueue);
        if (replica)
          replica.nodo.send({tipo, status});
        break;
      case "soyOriginal":
        this.original = true;
        break;
      default:
        console.log({tipo, topicTitle, mensaje, idConsumer}, "mensaje error handle manager");
        throw new Error("Invalid message type.");
    }
  }
}

function managerKilled(original) {
  if (original) {

    managerReplica.queues = managerOriginal.queues;
    managerReplica.queues.forEach((q) => {
      q.original.manager = managerReplica;
      q.replica.manager = managerReplica
    });

    managerOriginal = managerReplica;
    managerOriginal.original = true;
    managerOriginal.nodo.send({tipo: "init", original: true})
  }

  managerReplica = new Manager(false);

  console.log("Original", managerOriginal.nodo.pid);
  console.log("Replica", managerReplica.nodo.pid)
}