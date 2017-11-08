/*
	eslint max-nested-callbacks: [ "error", 7 ]
*/

"use strict";

// deps

	const path = require("path");
	const assert = require("assert");

	const ioClient = require("socket.io-client");

	const MultiServers = require(path.join(__dirname, "..", "lib", "main.js"));

// tests

describe("test wrong using", () => {

	const servers = new MultiServers();

	describe("connection", () => {

		it("should fail on missing eventListener", () => {

			return new Promise((resolve, reject) => {

				servers.connection().then(() => {
					reject(new Error("run with missing eventListener"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventListener", () => {

				return new Promise((resolve, reject) => {

					servers.connection("test").then(() => {
						reject(new Error("run with wrong eventListener"));
					}).catch(resolve);

				});

			});

	});

	describe("listen", () => {

		it("should fail on missing requestListener", () => {

			return new Promise((resolve, reject) => {

				servers.listen().then(() => {
					reject(new Error("run with missing requestListener"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong requestListener", () => {

				return new Promise((resolve, reject) => {

					servers.listen(false).then(() => {
						reject(new Error("run with wrong requestListener"));
					}).catch(resolve);

				});

			});

	});

	describe("emit", () => {

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				servers.emit().then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					servers.emit(false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

			it("should fail on empty eventName", () => {

				return new Promise((resolve, reject) => {

					servers.emit("").then(() => {
						reject(new Error("run with empty eventName"));
					}).catch(resolve);

				});

			});

	});

	describe("broadcast", () => {

		it("should fail on missing socket", () => {

			return new Promise((resolve, reject) => {

				servers.broadcast().then(() => {
					reject(new Error("run with missing socket"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong socket", () => {

				return new Promise((resolve, reject) => {

					servers.broadcast(false).then(() => {
						reject(new Error("run with wrong socket"));
					}).catch(resolve);

				});

			});

		it("should fail on missing server", () => {

			return new Promise((resolve, reject) => {

				servers.broadcast({}).then(() => {
					reject(new Error("run with missing server"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong server", () => {

				return new Promise((resolve, reject) => {

					servers.broadcast({}, false).then(() => {
						reject(new Error("run with wrong server"));
					}).catch(resolve);

				});

			});

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				servers.broadcast({}, {}).then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					servers.broadcast({}, {}, false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

			it("should fail on empty eventName", () => {

				return new Promise((resolve, reject) => {

					servers.broadcast({}, {}, "").then(() => {
						reject(new Error("run with empty eventName"));
					}).catch(resolve);

				});

			});

	});

	describe("removeAllListeners", () => {

		it("should fail on missing eventName", () => {

			return new Promise((resolve, reject) => {

				servers.removeAllListeners().then(() => {
					reject(new Error("run with missing eventName"));
				}).catch(resolve);

			});

		});

			it("should fail on wrong eventName", () => {

				return new Promise((resolve, reject) => {

					servers.removeAllListeners(false).then(() => {
						reject(new Error("run with wrong eventName"));
					}).catch(resolve);

				});

			});

	});

});

describe("release", () => {

	const servers = new MultiServers();

	it("should release servers", () => {
		return servers.release();
	});

});

describe("create servers", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	it("should create servers", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return servers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "servers number is incorrect");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			assert.strictEqual(1338, servers.servers[1].options.port, "last server name is incorrect");
			assert.strictEqual("basic http server 2", servers.servers[1].options.name, "last server name is incorrect");
			assert.strictEqual(false, servers.servers[1].options.ssl, "last server ssl is incorrect");

			return Promise.resolve();

		});

	});

});

describe("connect & disconnect", () => {

	describe("reverted", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should connect & disconnect on created servers", (done) => {

			servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				const socket = ioClient("http://localhost:1337");

				socket.on("disconnect", () => {
					done();
				}).on("connect", () => {
					socket.disconnect();
				});

				return Promise.resolve();

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			});

		}).timeout(1000);

	});

	describe("classical", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should connect & disconnect on created servers", (done) => {

			servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				const socket = ioClient("http://localhost:1337");

				socket.on("disconnect", () => {
					done();
				}).on("connect", () => {
					socket.disconnect();
				});

				return Promise.resolve();

			});

		}).timeout(1000);

	});

});

describe("removeAllListeners", () => {

	describe("global events", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should remove all listeners from these servers", () => {

			return servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return servers.connection(() => {
					// nothing to do here
				});

			}).then(() => {

				assert.strictEqual(2, servers.servers.length, "servers number is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets, "server sockets object is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets.sockets, "sockets manager object is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets.sockets._events, "event manager object is incorrect");
				assert.strictEqual("function", typeof servers.servers[0].sockets.sockets._events.connection, "connection event is incorrect");

				return Promise.resolve();

			}).then(() => {
				return servers.removeAllListeners("connection");
			}).then(() => {

				assert.strictEqual(2, servers.servers.length, "servers number is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets, "server sockets object is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets.sockets, "sockets manager object is incorrect");
				assert.strictEqual("object", typeof servers.servers[0].sockets.sockets._events, "event manager object is incorrect");
				assert.strictEqual("undefined", typeof servers.servers[0].sockets.sockets._events.connection, "connection event is incorrect");

				return Promise.resolve();

			});

		});

	});

	describe("removed events", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should remove all listeners from the sockets", (done) => {

			servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return servers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("test1", () => {
						done(new Error("Impossible to remove \"test1\" event"));
					}).on("test2", () => {
						done(new Error("Impossible to remove \"test2\" event"));
					}).on("test3", socket.disconnect).on("query", () => {

						socket.removeAllListeners("test1");

						servers.removeAllListeners("test2").then(() => {
							socket.emit("answer");
						});

					});

				});

			}).then(() => {

				const socketClient = ioClient("http://localhost:1337");

				socketClient.on("connect", () => {
					socketClient.emit("query");
				}).on("answer", () => {

					socketClient.emit("test1");
					socketClient.emit("test2");
					socketClient.emit("test3");

				});

				return Promise.resolve();

			});

		});

	});

});

describe("emit", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	it("should send data to the clients", (done) => {

		servers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return servers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return servers.connection((socket) => {

				socket.on("disconnect", () => {
					done();
				}).on("query", () => {

					servers.emit("answertest", "test").then(() => {
						return servers.emit("answer");
					});

				});

			});

		}).then(() => {

			const socketClient = ioClient("http://localhost:1337");

			socketClient.on("answer", socketClient.disconnect).on("connect", () => {
				socketClient.emit("query");
			});

			return Promise.resolve();

		});

	}).timeout(1000);

});

describe("on", () => {

	describe("classical", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should receive data from these servers", (done) => {

			servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				return servers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("query", socket.disconnect);

				});

			}).then(() => {

				const socketClient = ioClient("http://localhost:1337");

				socketClient.on("connect", () => {
					socketClient.emit("query");
				});

				return Promise.resolve();

			});

		}).timeout(1000);

	});

	describe("reverted", () => {

		const servers = new MultiServers();

		after(() => {
			return servers.release();
		});

		it("should receive data from these servers", (done) => {

			servers.addServer({
				"port": 1337,
				"name": "basic http server"
			}).then(() => {

				return servers.addServer({
					"port": 1338,
					"name": "basic http server 2"
				});

			}).then(() => {

				return servers.connection((socket) => {

					socket.on("disconnect", () => {
						done();
					}).on("query", socket.disconnect);

				});

			}).then(() => {

				return servers.listen(() => {
					// nothing to do here
				});

			}).then(() => {

				const socketClient = ioClient("http://localhost:1337");

				socketClient.on("connect", () => {
					socketClient.emit("query");
				});

				return Promise.resolve();

			});

		}).timeout(1000);

	});

});

describe("broadcast", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	it("should receive data from one servers", (done) => {

		servers.addServer({
			"port": 1337,
			"name": "basic http server"
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "basic http server 2"
			});

		}).then(() => {

			return servers.listen(() => {
				// nothing to do here
			});

		}).then(() => {

			return servers.connection((socket, server) => {

				if (1338 === server.options.port) {

					servers.broadcast(socket, server, "answer").then(() => {
						socket.disconnect();
					});

				}
				else {

					socket.on("disconnect", () => {
						done();
					});

				}

			});

		}).then(() => {

			const socketClient = ioClient("http://localhost:1337");

			socketClient.on("connect", () => {
				ioClient("http://localhost:1338");
			}).on("answer", () => {
				socketClient.disconnect();
			});

			return Promise.resolve();

		});

	}).timeout(2000);

});
