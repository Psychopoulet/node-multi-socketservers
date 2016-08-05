"use strict";

// deps

const path = require("path"),
      fs = require("fs"),
      nodemultiservers = require(path.join(__dirname, "..", "lib", "main.js"));

// private

  var multiservers = new nodemultiservers();

// run

return multiservers.addServer({
  port: 81,
  name: "http server 1"
}).then(() => {

  return multiservers.addServer({
    port: 82,
    name: "http server 2"
  });

}).then(() => {

  return multiservers.addServer({
    port: 83,
    name: "http server 3"
  });

}).then(() => {

  return multiservers.setTimeout(1 * 1000);

}).then(() => {

  return multiservers.listen((req, res) => {

    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {

      if (err) {

        console.log(err);

        res.writeHead(500, {"Content-Type": "text/html"});
        return res.end("Error loading index.html");

      }
      else {
        res.writeHead(200, {"Content-Type": "text/html"});
        return res.end(data);
      }

    });

  });

}).then(() => {

  return multiservers.connection((socket, server) => {

    socket.emit("hello", "connected to server \"" + server.options.name + "\"");

    multiservers.broadcast(socket, server, "broadcast", "hello from server \"" + server.options.name + "\"");

  });

}).then(() => {

  return new Promise((resolve, reject) => {

      setTimeout(() => {
        multiservers.release().then(() => { resolve(); }).catch(reject);
      }, 2 * 1000);

  });

}).then(() => {

  console.log("end");

})

.catch((err) => {

  console.log(err);

  multiservers.release().catch((err) => {
    console.log(err);
  });

});
