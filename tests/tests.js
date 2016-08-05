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

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

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

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");

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

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should connect & disconnect on created servers", (done) => {

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

			var socket = ioClient("http://localhost:1337");

			socket.on("disconnect", () => {
				done();
			}).on("connect", () => {
				socket.disconnect();
			});

		});

	}).timeout(1000);

});

describe("on", () => {

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should receive data from these servers", (done) => {

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

				socket.on("newconnection", () => {
					done();
				});

			});

		}).then(() => {

			var socket = ioClient("http://localhost:1337");

			return socket.on("connect", () => {
				socket.emit("newconnection");
			});

		});

	}).timeout(1000);

});
