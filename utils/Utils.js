class Utils {

    getTopic(topicTitle, topics){
        return topics.find(topic => topicTitle === topic.topicTitle);
    }

    getConsumerSocket(id, sockets){
        return sockets.find(reg => id === reg.idConsumer).socket;
    }

}


module.exports = new Utils();