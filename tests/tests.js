"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),

			ioClient = require("socket.io-client"),

			multiservers = require(path.join(__dirname, "..", "lib", "main.js"));

// private

	var servers = new multiservers();

// tests

describe("test wrong using", () => {

	describe("connection", () => {

		it("should fail on missing eventListener", () => {

			return servers.connection().then(() => {
				return Promise.reject("run with missing eventListener");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong eventListener", () => {

				return servers.connection("test").then(() => {
					return Promise.reject("run with wrong eventListener");
				}).catch(() => {
					return Promise.resolve();
				});

			});

	});

	describe("emit", () => {

		it("should fail on missing eventName", () => {

			return servers.emit().then(() => {
				return Promise.reject("run with missing eventName");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong eventName", () => {

				return servers.emit(false).then(() => {
					return Promise.reject("run with wrong eventName");
				}).catch(() => {
					return Promise.resolve();
				});

			});

	});

	describe("broadcast", () => {

		it("should fail on missing socket", () => {

			return servers.broadcast().then(() => {
				return Promise.reject("run with missing socket");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong socket", () => {

				return servers.broadcast(false).then(() => {
					return Promise.reject("run with wrong socket");
				}).catch(() => {
					return Promise.resolve();
				});

			});

		it("should fail on missing server", () => {

			return servers.broadcast({}).then(() => {
				return Promise.reject("run with missing server");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong server", () => {

				return servers.broadcast({}, false).then(() => {
					return Promise.reject("run with wrong server");
				}).catch(() => {
					return Promise.resolve();
				});

			});

		it("should fail on missing eventName", () => {

			return servers.broadcast({}, {}).then(() => {
				return Promise.reject("run with missing eventName");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong server", () => {

				return servers.broadcast({}, {}, false).then(() => {
					return Promise.reject("run with wrong eventName");
				}).catch(() => {
					return Promise.resolve();
				});

			});

	});

	describe("removeAllListeners", () => {

		it("should fail on missing eventName", () => {

			return servers.removeAllListeners().then(() => {
				return Promise.reject("run with missing eventName");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong eventName", () => {

				return servers.removeAllListeners(false).then(() => {
					return Promise.reject("run with wrong eventName");
				}).catch(() => {
					return Promise.resolve();
				});

			});

	});

});

describe("release", () => {

	it("should release servers", () => {
		return servers.release();
	});

});

describe("create servers", () => {

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should create servers", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server"
		}).then(() => {

			return servers.addServer({
				port: 1338,
				name: "basic http server 2"
			});

		}).then(() => {
			return servers.listen(() => { });
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

		before(() => { return servers.release(); });
		after(() => { return servers.release(); });

		it("should connect & disconnect on created servers", (done) => {

			servers.addServer({
				port: 1337,
				name: "basic http server"
			}).then(() => {

				return servers.addServer({
					port: 1338,
					name: "basic http server 2"
				});

			}).then(() => {

				let socket = ioClient("http://localhost:1337");

				socket.on("disconnect", () => {
					done();
				}).on("connect", () => {
					socket.disconnect();
				});

				return Promise.resolve();

			}).then(() => {
				return servers.listen(() => {});
			});

		}).timeout(1000);

	});

	describe("classical", () => {

		before(() => { return servers.release(); });
		after(() => { return servers.release(); });

		it("should connect & disconnect on created servers", (done) => {

			servers.addServer({
				port: 1337,
				name: "basic http server"
			}).then(() => {

				return servers.addServer({
					port: 1338,
					name: "basic http server 2"
				});

			}).then(() => {
				return servers.listen(() => {});
			}).then(() => {

				let socket = ioClient("http://localhost:1337");

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

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should remove all listeners from these servers", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server"
		}).then(() => {

			return servers.addServer({
				port: 1338,
				name: "basic http server 2"
			});

		}).then(() => {
			return servers.listen(() => {});
		}).then(() => {

			return servers.connection((socket) => {
				socket.on("newconnection", () => { });
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

describe("on", () => {

	describe("classical", () => {

		before(() => { return servers.release(); });
		after(() => { return servers.release(); });

		it("should receive data from these servers", (done) => {

			servers.addServer({
				port: 1337,
				name: "basic http server"
			}).then(() => {

				return servers.addServer({
					port: 1338,
					name: "basic http server 2"
				});

			}).then(() => {
				return servers.listen(() => {});
			}).then(() => {

				return servers.connection((socket) => {

					socket.on("newconnection", () => {
						socket.disconnect();
						done();
					});

				});

			}).then(() => {

				let socket = ioClient("http://localhost:1337");

				socket.on("connect", () => {
					socket.emit("newconnection");
				});

				return Promise.resolve();

			});

		}).timeout(1000);

	});

	describe("reverted", () => {

		before(() => { return servers.release(); });
		after(() => { return servers.release(); });

		it("should receive data from these servers", (done) => {

			servers.addServer({
				port: 1337,
				name: "basic http server"
			}).then(() => {

				return servers.addServer({
					port: 1338,
					name: "basic http server 2"
				});

			}).then(() => {

				return servers.connection((socket) => {

					socket.on("newconnection", () => {
						socket.disconnect();
						done();
					});

				});

			}).then(() => {
				return servers.listen(() => {});
			}).then(() => {

				let socket = ioClient("http://localhost:1337");

				socket.on("connect", () => {
					socket.emit("newconnection");
				});

				return Promise.resolve();

			});

		}).timeout(1000);

	});
	
});

describe("broadcast", () => {

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should receive data from one servers", (done) => {

		servers.addServer({
			port: 1337,
			name: "basic http server"
		}).then(() => {

			return servers.addServer({
				port: 1338,
				name: "basic http server 2"
			});

		}).then(() => {
			return servers.listen(() => {});
		}).then(() => {

			return servers.connection((socket, server) => {

				if(1338 === server.options.port) {

					servers.broadcast(socket, server, "newconnection").then(() => {
						socket.disconnect();
					});
					
				}
				else {

					socket.on("done", () => {
						socket.disconnect();
						done();
					});

				}

			});

		}).then(() => {

			ioClient("http://localhost:1337").on("newconnection", function() {
				this.emit("done");
			}).on("connect", () => {
				ioClient("http://localhost:1338");
			});

			return Promise.resolve();

		});

	}).timeout(2000);

});
