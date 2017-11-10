/*
	eslint max-nested-callbacks: [ "error", 7 ]
*/
/*
	eslint no-implicit-globals: 0
*/

"use strict";

// deps

	const path = require("path");
	const assert = require("assert");

	const ioClient = require("socket.io-client");

	const MultiServers = require(path.join(__dirname, "..", "lib", "main.js"));

// private

	// methods

		/**
		* Create socketio client
		* @param {int} port server port
		* @returns {socket.io-client} The socketio client
		*/
		function _createClient (port) {

			return ioClient("http://localhost:" + port, {
				"reconnection": false
			});

		}

// tests

describe("test wrong using", () => {

	const multiServers = new MultiServers();

	describe("connection", () => {

		it("should fail on missing eventListener", () => {

			return new Promise((resolve, reject) => {

				multiServers.connection().then(() => {
					reject(new Error("run with missing eventListener"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventListener", () => {

				return new Promise((resolve, reject) => {

					multiServers.connection("test").then(() => {
						reject(new Error("run with wrong eventListener"));
					}).catch(resolve);

				});

			});

	});

	describe("listen", () => {

		it("should fail on missing requestListener", () => {

			return new Promise((resolve, reject) => {

				multiServers.listen().then(() => {
					reject(new Error("run with missing requestListener"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong requestListener", () => {

				return new Promise((resolve, reject) => {

					multiServers.listen(false).then(() => {
						reject(new Error("run with wrong requestListener"));
					}).catch(resolve);

				});

			});

	});

	describe("emit", () => {

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				multiServers.emit().then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					multiServers.emit(false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

			it("should fail on empty eventName", () => {

				return new Promise((resolve, reject) => {

					multiServers.emit("").then(() => {
						reject(new Error("run with empty eventName"));
					}).catch(resolve);

				});

			});

	});

	describe("broadcast", () => {

		it("should fail on missing socket", () => {

			return new Promise((resolve, reject) => {

				multiServers.broadcast().then(() => {
					reject(new Error("run with missing socket"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong socket", () => {

				return new Promise((resolve, reject) => {

					multiServers.broadcast(false).then(() => {
						reject(new Error("run with wrong socket"));
					}).catch(resolve);

				});

			});

		it("should fail on missing server", () => {

			return new Promise((resolve, reject) => {

				multiServers.broadcast({}).then(() => {
					reject(new Error("run with missing server"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong server", () => {

				return new Promise((resolve, reject) => {

					multiServers.broadcast({}, false).then(() => {
						reject(new Error("run with wrong server"));
					}).catch(resolve);

				});

			});

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				multiServers.broadcast({}, {}).then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					multiServers.broadcast({}, {}, false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

			it("should fail on empty eventName", () => {

				return new Promise((resolve, reject) => {

					multiServers.broadcast({}, {}, "").then(() => {
						reject(new Error("run with empty eventName"));
					}).catch(resolve);

				});

			});

	});

	describe("removeAllListeners", () => {

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				multiServers.removeAllListeners().then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					multiServers.removeAllListeners(false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

	});

});

describe("release", () => {

	const multiServers = new MultiServers();

	it("should release servers", () => {
		return multiServers.release();
	});

});

describe("create servers", () => {

	const multiServers = new MultiServers();

	after(() => {
		return multiServers.release();
	});

	it("should create servers", () => {

		return multiServers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return multiServers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			// test already listening
			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			assert.strictEqual(2, multiServers.servers.length, "servers number is incorrect");

			assert.strictEqual(1337, multiServers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", multiServers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, multiServers.servers[0].options.ssl, "first server ssl is incorrect");

			assert.strictEqual(1338, multiServers.servers[1].options.port, "last server name is incorrect");
			assert.strictEqual("basic http server 2", multiServers.servers[1].options.name, "last server name is incorrect");
			assert.strictEqual(false, multiServers.servers[1].options.ssl, "last server ssl is incorrect");

			return Promise.resolve();

		});

	});

});

describe("connect & disconnect", () => {

	const multiServers = new MultiServers();

	afterEach(() => {
		return multiServers.release();
	});

	describe("server side", () => {

		it("should connect & disconnect on created servers", () => {

			return multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return multiServers.connection((socket) => {
					socket.disconnect();
				});

			}).then(() => {

				return new Promise((resolve) => {
					_createClient(1337).on("disconnect", resolve);
				});

			});

		});

	});

	describe("client side", () => {

		it("should connect & disconnect on created servers", (done) => {

			multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return multiServers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					});

				});

			}).then(() => {

				const socket = _createClient(1337);

				socket.on("connect", () => {
					socket.disconnect();
				});

			}).catch(done);

		});

	});

});

describe("removeAllListeners", () => {

	describe("global events", () => {

		const multiServers = new MultiServers();

		after(() => {
			return multiServers.release();
		});

		it("should remove all inexistant listener", () => {
			return multiServers.removeAllListeners("test");
		});

		it("should remove all inexistant listeners", () => {
			return multiServers.removeAllListeners([ "test" ]);
		});

		it("should remove all listeners from these servers", () => {

			return multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return multiServers.connection(() => {
					// nothing to do here
				});

			}).then(() => {

				assert.strictEqual(2, multiServers.servers.length, "servers number is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets, "server sockets object is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets.sockets, "sockets manager object is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets.sockets._events, "event manager object is incorrect");

				assert.strictEqual(
					"function",
					typeof multiServers.servers[0].sockets.sockets._events.connection,
					"connection event is incorrect"
				);

				return Promise.resolve();

			}).then(() => {
				return multiServers.removeAllListeners("connection");
			}).then(() => {

				assert.strictEqual(2, multiServers.servers.length, "servers number is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets, "server sockets object is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets.sockets, "sockets manager object is incorrect");
				assert.strictEqual("object", typeof multiServers.servers[0].sockets.sockets._events, "event manager object is incorrect");

				assert.strictEqual(
					"undefined",
					typeof multiServers.servers[0].sockets.sockets._events.connection,
					"connection event is incorrect"
				);

				return Promise.resolve();

			});

		});

	});

	describe("removed events", () => {

		const multiServers = new MultiServers();

		after(() => {
			return multiServers.release();
		});

		it("should remove all listeners from the sockets", (done) => {

			multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return multiServers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("test1", () => {
						done(new Error("Impossible to remove \"test1\" event"));
					}).on("test2", () => {
						done(new Error("Impossible to remove \"test2\" event"));
					}).on("test3", socket.disconnect).on("query", () => {

						socket.removeAllListeners("test1");

						multiServers.removeAllListeners("test2").then(() => {
							socket.emit("answer");
						});

					});

				});

			}).then(() => {

				return new Promise((resolve) => {

					const socketClient = _createClient(1337);

					socketClient.on("connect", () => {
						socketClient.emit("query");
						resolve();
					}).on("answer", () => {

						socketClient.emit("test1");
						socketClient.emit("test2");
						socketClient.emit("test3");

					});

				});

			});

		}).timeout(1000);

	});

});

describe("emit", () => {

	const multiServers = new MultiServers();

	after(() => {
		return multiServers.release();
	});

	it("should send data to the clients", (done) => {

		multiServers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return multiServers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return multiServers.connection((socket) => {

				socket.on("disconnect", () => {
					done();
				}).on("query", () => {

					multiServers.emit("answertest", "test").then(() => {
						return multiServers.emit("answer");
					});

				});

			});

		}).then(() => {

			return new Promise((resolve) => {

				const socketClient = _createClient(1337);

				socketClient.on("answer", socketClient.disconnect).on("connect", () => {
					socketClient.emit("query");
					resolve();
				});

			});

		});

	}).timeout(1000);

});

describe("on", () => {

	describe("classical", () => {

		const multiServers = new MultiServers();

		after(() => {
			return multiServers.release();
		});

		it("should receive data from these servers", (done) => {

			multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return multiServers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("query", socket.disconnect);

				});

			}).then(() => {

				return new Promise((resolve) => {

					const socketClient = _createClient(1337);

					socketClient.on("connect", () => {
						socketClient.emit("query");
						resolve();
					});

				});

			});

		}).timeout(1000);

	});

	describe("reverted", () => {

		const multiServers = new MultiServers();

		after(() => {
			return multiServers.release();
		});

		it("should receive data from these servers", (done) => {

			multiServers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return multiServers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return multiServers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("query", socket.disconnect);

				});

			}).then(() => {

				return multiServers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return new Promise((resolve) => {

					const socketClient = _createClient(1337);

					socketClient.on("connect", () => {
						socketClient.emit("query");
						resolve();
					});

				});

			});

		}).timeout(1000);

	});

});

describe("broadcast", () => {

	const multiServers = new MultiServers();

	after(() => {
		return multiServers.release();
	});

	it("should receive data from one servers", (done) => {

		multiServers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return multiServers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return multiServers.connection((socket, server) => {

				if (1338 === server.options.port) {

					multiServers.broadcast(socket, server, "testwithdata", false).then(() => {

						return multiServers.broadcast(socket, server, "answer").then(() => {
							socket.disconnect();
						});

					});

				}
				else {

					socket.on("disconnect", () => {
						done();
					});

				}

			});

		}).then(() => {

			return new Promise((resolve) => {

				const socketClient = _createClient(1337);

				socketClient.on("connect", () => {

					_createClient(1338);

					resolve();

				}).on("answer", () => {
					socketClient.disconnect();
				});

			});

		});

	}).timeout(1000);

});

describe("close", () => {

	const multiServers = new MultiServers();

	afterEach(() => {
		return multiServers.release();
	});

	it("should close server without connection", () => {

		return multiServers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return multiServers.connection(() => {
				// nothing to do here
			});

		}).then(() => {
			return multiServers.release();
		});

	}).timeout(2000);

	it("should close server with connection", () => {

		return multiServers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return multiServers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return multiServers.connection(() => {
				multiServers.release();
			});

		}).then(() => {

			return new Promise((resolve) => {

				_createClient(1337).on("disconnect", resolve);

			});

		});

	}).timeout(2000);

});
