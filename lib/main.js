"use strict";

// deps

	const io = require("socket.io");

// module

module.exports = class MultiSocketServers extends require("node-multi-webserver") {

	listen(requestListener) {

		this.servers.forEach((server, i) => {
			this.servers[i].sockets = null;
		});

		return super.listen(requestListener).then(() => {

			this.servers.forEach((server, i) => {
				this.servers[i].sockets = io(server.server);
			});

			return Promise.resolve();

		});

	}

	connection(eventListener) {

		if (!eventListener) {
			return Promise.reject("There is no eventListener");
		}
			else if ("function" !== typeof eventListener) {
				return Promise.reject("eventListener is not a function");
			}
		else {

			this.servers.forEach((server) => {

				if (server.sockets) {

					server.sockets.on("connection", (socket) => {
						eventListener(socket, server);
					});
					
				}

			});

			return Promise.resolve();

		}

	}

	emit(eventName, data) {

		if (!eventName) {
			return Promise.reject("There is no eventName");
		}
			else if ("string" !== typeof eventName) {
				return Promise.reject("eventName is not a string");
			}
		else {

			this.servers.forEach((server) => {

				if (server.sockets) {

					if (data) {
						server.sockets.emit(eventName, data);
					}
					else {
						server.sockets.emit(eventName);
					}

				}

			});

			return Promise.resolve();

		}

	}

	broadcast(socket, server, eventName, data) {

		if (!socket) {
			return Promise.reject("There is no socket");
		}
			else if ("object" !== typeof socket) {
				return Promise.reject("socket is not a object");
			}
		else if (!server) {
			return Promise.reject("There is no server");
		}
			else if ("object" !== typeof server) {
				return Promise.reject("server is not a object");
			}
		else if (!eventName) {
			return Promise.reject("There is no eventName");
		}
			else if ("string" !== typeof eventName) {
				return Promise.reject("eventName is not a string");
			}
		else {

			this.servers.forEach((_server) => {

				if (_server.sockets) {

					if (_server.options.port !== server.options.port) {

						if (data) {
							_server.sockets.emit(eventName, data);
						}
						else {
							_server.sockets.emit(eventName);
						}

					}
					else {

						if (data) {
							socket.broadcast.emit(eventName, data);
						}
						else {
							socket.broadcast.emit(eventName);
						}

					}

				}

			});

			return Promise.resolve();

		}

	}

	removeAllListeners(eventName) {

		if (!eventName) {
			return Promise.reject("There is no eventName");
		}
			else if ("string" !== typeof eventName) {
				return Promise.reject("eventName is not a string");
			}
		else {

			this.servers.forEach((server) => {

				if (server.sockets && server.sockets.sockets) {
					server.sockets.sockets.removeAllListeners(eventName);
				}

			});
			
			return Promise.resolve();

		}

	}

	close() {

		if (0 >= this.servers.length) {
			return Promise.resolve();
		}
		else {

			return new Promise((resolve) => {

				this.servers.forEach((server) => {

					if (server.sockets) {

						server.sockets.close();

						if (server.sockets.sockets) {

							if (server.sockets.sockets._events) {

								for (let event in server.sockets.sockets._events) {
									server.sockets.sockets.removeAllListeners(event);
								}

							}

							if (server.sockets.sockets.sockets) {

								for (let id in server.sockets.sockets.sockets) {
									server.sockets.sockets.sockets[id].disconnect(true);
								}

							}
							
						}

					}

				});

				resolve();

			}).then(() => {
				return super.close();
			});

		}

	}

};
