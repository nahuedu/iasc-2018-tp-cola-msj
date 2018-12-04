module.exports = (id, consumers) => {
	var consumer 
	for (var i = 0; i < consumers.length; i++) {
		if (consumers[i].id == id)
			consumer = consumers[i]
	}

	return consumer
}