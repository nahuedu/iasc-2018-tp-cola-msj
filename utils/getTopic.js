module.exports = (topic, topics) => {
	var t 
	for (var i = 0; i < topics.length; i++) {
		if (topics[i].topic == topic)
			t = topics[i]
	}

	return t
}
