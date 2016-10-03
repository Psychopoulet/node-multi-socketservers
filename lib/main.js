"use strict";

// deps

	const io = require("socket.io");

// module

module.exports = class MultiSocketServers extends require("node-multi-webserver") {

	constructor() {

		super();

		this._tmpOnConnection = [];

	}

	listen(requestListener) {

		if (this.listening()) {
			return Promise.resolve();
		}
		else {

			// web server init
			return super.listen(requestListener).then(() => {

				// socket server init
				return new Promise((resolve) => {

					this.servers.forEach((server, i) => {

						this.servers[i].sockets = null;
						this.servers[i].sockets = io(server.server);

						if (0 < this._tmpOnConnection.length) {

							let _tmpOnConnection = this._tmpOnConnection.slice();

							server.sockets.on("connection", (socket) => {

								_tmpOnConnection.forEach((tmpOnConnection) => {
									new Promise(() => {
										tmpOnConnection(socket, server);
									});
								});

							});

						}

					});

					this._tmpOnConnection = [];

					resolve();

				});

			}).catch((err) => {
				(0, console).log(err);
			});

		}

	}

	connection(eventListener) {

		if (!eventListener) {
			return Promise.reject("There is no eventListener");
		}
			else if ("function" !== typeof eventListener) {
				return Promise.reject("eventListener is not a function");
			}
		else {

			return new Promise((resolve) => {

				if (!this.listening()) {
					this._tmpOnConnection.push(eventListener);
				}
				else {

					this.servers.forEach((server) => {

						if (server.sockets) {

							server.sockets.on("connection", (socket) => {
								eventListener(socket, server);
							});
							
						}

					});
					
				}

				resolve();

			});

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

			return new Promise((resolve) => {
				
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

				resolve();

			});

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

			return new Promise((resolve) => {
				
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

				resolve();

			});

		}

	}

	removeAllListeners(eventNames) {

		if (!eventNames) {
			return Promise.reject("There is no eventNames");
		}
			else if ("string" !== typeof eventNames && !(eventNames instanceof Array)) {
				return Promise.reject("eventNames is not a string or an array");
			}
		else {

			return new Promise((resolve) => {
				
				if (!(eventNames instanceof Array)) {
					eventNames = [eventNames];
				}

				this.servers.forEach((server) => {

					if (server.sockets && server.sockets.sockets) {

						eventNames.forEach((eventName) => {
							server.sockets.sockets.removeAllListeners(eventName);
						});

					}

				});
			
				resolve();

			});

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

	release() {

		this._tmpOnConnection = [];

		return super.release();

	}

};
