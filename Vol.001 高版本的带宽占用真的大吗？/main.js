const net = require("net");
const Throttle = require("throttle");
const speedometer = require("speedometer");
const http = require("http");
const throttleSpeed = 100 * 1024; // 0.1 MB/s

const downloadSpeed = speedometer();
const uploadSpeed = speedometer();

const server = net.createServer((clientSocket) => {
  const serverSocket = net.connect({ port: 25565, host: "localhost" });

  const clientThrottle = new Throttle(throttleSpeed);
  const serverThrottle = new Throttle(throttleSpeed);


  clientSocket.pipe(clientThrottle).pipe(serverSocket);
  serverSocket.pipe(serverThrottle).pipe(clientSocket);

  clientSocket.on("data", (data) => {
    uploadSpeed(data.length);
  });

  serverSocket.on("data", (data) => {
    downloadSpeed(data.length);
  });

});

server.listen(32767, () => {
  console.log("TCP proxy server listening on port 32767");
});

http.createServer(function(request, response) {
  if (request.url.endsWith("/get")) {
    response.write(`Download speed: ${downloadSpeed()} bytes/sec\nUpload speed: ${uploadSpeed()} bytes/sec`);
  } else {
    response.write(`<html lang="zh">
      <head>
        <title>Monitor</title>
        <meta http-equiv="refresh" content="0.2"/></head>
      <body>
        Download speed: ${downloadSpeed()} bytes/sec
        <br>
        Upload speed: ${uploadSpeed()} bytes/sec
  `);
  }
  response.end();
}).listen(3000);