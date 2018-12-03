class Utils {

    getTopic(topicTitle, topics){
        return topics.find(topic => topicTitle == topic.topicTitle);
    }

    getConsumerSocket(id, sockets){
        return sockets.find(socket => id == socket.idConsumer);
    }

}


module.exports = new Utils();