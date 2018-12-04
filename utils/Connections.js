const config = require('config');

class Connections {

    constructor() {
        this.host = config.get('manager.host');
        this.consumerPort = config.get('manager.consumer-port');
        this.producerPort = config.get('manager.producer-port');
    }

}

module.exports = new Connections();