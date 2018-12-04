module.exports = (id, sockets) => {
	var socket = false
	for (var i = 0; i < sockets.length; i++) {
        if (sockets[i].idConsumer == id)
          socket = sockets[i]
      }

      return socket

}