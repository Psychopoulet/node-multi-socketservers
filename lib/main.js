"use strict";

// deps

	const io = require("socket.io");

// module

module.exports = class MultiSocketServers extends require("node-multi-webserver") {

	constructor () {

		super();

		this._tmpOnConnection = [];
		this._sockets = [];

	}

	listen (requestListener) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof requestListener) {
				return Promise.reject(new ReferenceError("There is no requestListener"));
			}
				else if ("function" !== typeof requestListener) {
					return Promise.reject(new TypeError("requestListener is not a function"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			return this.listening() ?
				Promise.resolve() :

				// web server init
				super.listen(requestListener).then(() => {

					this.servers.forEach((server, i) => {

						this.servers[i].sockets = null;
						this.servers[i].sockets = io(server.server);

						if (0 < this._tmpOnConnection.length) {

							const _tmpOnConnection = this._tmpOnConnection.slice();

							server.sockets.on("connection", (socket) => {

								_tmpOnConnection.forEach((tmpOnConnection) => {

									try {
										tmpOnConnection(socket, server);
									}
									catch (e) {
										// nothing to do here
									}

								});

							});

						}

					});

					this._tmpOnConnection = [];

					return Promise.resolve();

				});

		});

	}

	connection (eventListener) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof eventListener) {
				return Promise.reject(new ReferenceError("There is no eventListener"));
			}
				else if ("function" !== typeof eventListener) {
					return Promise.reject(new TypeError("eventListener is not a function"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			return !this.listening() ?
				Promise.resolve().then(() => {
					this._tmpOnConnection.push(eventListener);
					return Promise.resolve();
				}) :
				Promise.resolve().then(() => {

					this.servers.forEach((server) => {

						if (server.sockets) {

							server.sockets.on("connection", (socket) => {

								socket.on("disconnect", () => {

									for (let i = 0; i < this._sockets.length; ++i) {

										if (socket.id === this._sockets[i].id && server.options.port === this._sockets[i].server) {

											try {
												this._sockets[i].close();
											}
											catch (e) {
												// nothing to do here
											}

											this._sockets.splice(i, 1);

											break;

										}

									}

								});

								this._sockets.push({
									"server": server.options.port,
									"id": socket.id,
									"removeAllListeners": (eventNames) => {
										socket.removeAllListeners(eventNames);
									},
									"close": () => {
										socket.removeAllListeners();
										socket.disconnect(true);
									}
								});

								try {
									eventListener(socket, server);
								}
								catch (e) {
									// nothing to do here
								}

							});

						}

					});

					return Promise.resolve();

				});

		});

	}

	emit (eventName, data) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof eventName) {
				return Promise.reject(new ReferenceError("There is no eventName"));
			}
				else if ("string" !== typeof eventName) {
					return Promise.reject(new TypeError("eventName is not a string"));
				}
				else if ("" === eventName.trim()) {
					return Promise.reject(new TypeError("eventName is empty"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			this.servers.forEach((server) => {

				if (server.sockets) {

					if ("undefined" !== typeof data) {
						server.sockets.emit(eventName, data);
					}
					else {
						server.sockets.emit(eventName);
					}

				}

			});

			return Promise.resolve();

		});

	}

	broadcast (socket, server, eventName, data) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof socket) {
				return Promise.reject(new ReferenceError("There is no socket"));
			}
				else if ("object" !== typeof socket) {
					return Promise.reject(new TypeError("socket is not an object"));
				}
			else if ("undefined" === typeof server) {
				return Promise.reject(new ReferenceError("There is no server"));
			}
				else if ("object" !== typeof server) {
					return Promise.reject(new TypeError("server is not an object"));
				}
			else if ("undefined" === typeof eventName) {
				return Promise.reject(new ReferenceError("There is no eventName"));
			}
				else if ("string" !== typeof eventName) {
					return Promise.reject(new TypeError("eventName is not a string"));
				}
				else if ("" === eventName.trim()) {
					return Promise.reject(new TypeError("eventName is empty"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			this.servers.forEach((_server) => {

				if (_server.sockets) {

					if (_server.options.port !== server.options.port) {

						if ("undefined" !== typeof data) {
							_server.sockets.emit(eventName, data);
						}
						else {
							_server.sockets.emit(eventName);
						}

					}
					else if ("undefined" !== typeof data) {
						socket.broadcast.emit(eventName, data);
					}
					else {
						socket.broadcast.emit(eventName);
					}

				}

			});

			return Promise.resolve();

		});

	}

	removeAllListeners (eventNames) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof eventNames) {
				return Promise.reject(new ReferenceError("There is no eventNames"));
			}
				else if ("string" !== typeof eventNames && !(eventNames instanceof Array)) {
					return Promise.reject(new TypeError("eventNames is not an array"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			("string" === typeof eventNames ? [ eventNames ] : eventNames).forEach((eventName) => {

				for (let i = 0; i < this._sockets.length; ++i) {
					this._sockets[i].removeAllListeners(eventName);
				}

			});

			return Promise.resolve();

		}).then(() => {

			this.servers.forEach((server) => {

				if (server.sockets && server.sockets.sockets) {

					("string" === typeof eventNames ? [ eventNames ] : eventNames).forEach((eventName) => {
						server.sockets.sockets.removeAllListeners(eventName);
					});

				}

			});

			return Promise.resolve();

		});

	}

	close () {

		return Promise.resolve().then(() => {

			return 0 >= this.servers.length ?
				Promise.resolve() :
				Promise.resolve().then(() => {

					this.servers.forEach((server) => {

						if (server.sockets) {
							server.sockets.close();
						}

					});

					for (let i = 0; i < this._sockets.length; ++i) {

						try {
							this._sockets[i].close();
						}
						catch (e) {
							// nothing to do here
						}

					}

					this._sockets = [];

					return Promise.resolve();

				});

		}).then(() => {
			return super.close();
		});

	}

	release () {

		return Promise.resolve().then(() => {

			this._tmpOnConnection = [];
			return super.release();

		});

	}

};
