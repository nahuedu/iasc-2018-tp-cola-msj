module.exports = (topic, topics) => {
	var topicReturn = null
    topics.forEach( (t) => {
        if (topic == t.topic)
            topicReturn = t
    })

    return topicReturn
}