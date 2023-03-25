const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const net = require('net');
const Throttle = require('throttle');
const speedometer = require('speedometer');
const throttleSpeed = 100 * 1024; // 0.1 MB/s

const server = net.createServer((clientSocket) => {
  const serverSocket = net.connect({ port: 25565, host: 'localhost' });

  const clientThrottle = new Throttle(throttleSpeed);
  const serverThrottle = new Throttle(throttleSpeed);

  const downloadSpeed = speedometer();
  const uploadSpeed = speedometer();

  clientSocket.pipe(clientThrottle).pipe(serverSocket);
  serverSocket.pipe(serverThrottle).pipe(clientSocket);

  clientSocket.on('data', (data) => {
    uploadSpeed(data.length);
  });

  serverSocket.on('data', (data) => {
    downloadSpeed(data.length);
  });

  setInterval(() => {
    console.log('Download speed: ' + downloadSpeed() + ' bytes/sec');
    console.log('Upload speed: ' + uploadSpeed() + ' bytes/sec');
  }, 1000);

});

server.listen(32767, () => {
  console.log('TCP proxy server listening on port 32767');
  // const bot = mineflayer.createBot({
  //   host: 'localhost',
  //   port: 32767,
  //   username: 'Bot'
  // });
  // bot.once('spawn', () => {
  //   mineflayerViewer(bot, { port: 1109 });
  // });
});
