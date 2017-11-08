# node-multi-socketservers
A multi http and socket servers manager, based on node-multi-webserver

[![Build Status](https://api.travis-ci.org/Psychopoulet/node-multi-socketservers.svg?branch=develop)](https://travis-ci.org/Psychopoulet/node-multi-socketservers)
[![Coverage Status](https://coveralls.io/repos/github/Psychopoulet/node-multi-socketservers/badge.svg?branch=develop)](https://coveralls.io/github/Psychopoulet/node-multi-socketservers)
[![Dependency Status](https://img.shields.io/david/Psychopoulet/node-multi-socketservers/develop.svg)](https://github.com/Psychopoulet/node-multi-socketservers)

# Installation

```bash
$ npm install node-multi-socketservers
```

# Features

  * run the same server with different configurations (ports, ssl, etc...)
  * socket communication with all servers

# Doc

* see [node-multi-webservers](https://www.npmjs.com/package/node-multi-webserver) documentation for webservers management

* ``` connection(function eventListener) : return Promise instance ``` eventListener((socket[ , server ]) => {})
* ``` emit(string eventName[, mixed data]) : return Promise instance ```
* ``` broadcast(SocketIO.Socket socket, http.Server server, string eventName, [, mixed data]) : return Promise instance ``` broadcast on all servers
* ``` removeAllListeners(string|array eventNames) : return Promise instance ``` remove all listener of an event or an array of events for all the servers and sockets 

# Examples

### with express

```js
const http = require("http"),
      https = require("https"),
      express = require("express"),
      multiservers = require("node-multi-socketservers");

let servers = new multiservers(),
    app = express().get("/", (req, res) => {
  res.set("Content-Type", contentType).send(message);
});

return servers.addServer({
  port: 80,
  name: "http server"
}).then(() => {

  return servers.addServer({
    port: 443,
    name: "secure server",
    ssl: true,
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.addServer({
    port: 1337,
    name: "admin server",
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.setTimeout(2 * 1000);

}).then(() => {

  return servers.listen(app);

}).then(() => {

  return servers.connection((socket, server) => {

    servers.broadcast(socket, server, "newconnection");

    socket.on("disconnect", () => {
      servers.broadcast(socket, server, "disconnection");
    });

  });

}).catch((err) => {

  console.log(err);

  servers.release().catch((err) => {
    console.log(err);
  });

});
```
### native

```js
const http = require("http"),
      https = require("https"),
      multiservers = require("node-multi-socketservers");

let servers = new multiservers();

return servers.addServer({
  port: 80,
  name: "http server"
}).then(() => {

  return servers.addServer({
    port: 443,
    name: "secure server",
    ssl: true,
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.addServer({
    port: 1337,
    name: "admin server",
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.setTimeout(2 * 1000);

}).then(() => {

  return servers.listen((req, res) => {

    res.writeHead(200, {"Content-Type": contentType});
    res.end("hello world, from http:80, https:443 or https:1337");

  });

}).then(() => {

  return servers.connection((socket, server) => {

    servers.broadcast(socket, server, "newconnection");

    socket.on("disconnect", () => {
      servers.broadcast(socket, server, "disconnection");
    });

  });

}).catch((err) => {

  console.log(err);

  servers.release().catch((err) => {
    console.log(err);
  });

});
```


# Tests

```bash
$ gulp
```

## License

  [ISC](LICENSE)
