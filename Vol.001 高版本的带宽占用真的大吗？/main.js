const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const net = require('net');

const localPort = 32767; // 本地端口
const remoteHost = '127.0.0.1'; // 远程主机
const remotePort = 25565; // 远程端口

// 创建本地TCP服务器
const server = net.createServer((socket) => {
  console.log('客户端已连接');

  // 连接到远程服务器
  const remoteSocket = net.createConnection({
    host: remoteHost,
    port: remotePort
  });

  // 将本地套接字上的所有数据转发到远程套接字
  socket.pipe(remoteSocket);

  // 将远程套接字上的所有数据转发到本地套接字
  remoteSocket.pipe(socket);

  // 当远程套接字关闭时关闭本地套接字
  remoteSocket.on('close', () => {
    socket.end();
  });

  // 当本地套接字关闭时关闭远程套接字
  socket.on('close', () => {
    remoteSocket.end();
  });
});

// 启动本地TCP服务器
server.listen(localPort, () => {
  console.log(`本地服务器已启动，监听端口 ${localPort}`);
});

function main(){
    
    const bot = mineflayer.createBot({
        host: 'localhost',
        port: 32767,
        username: 'Bot'
    });
    bot.once('spawn', () => {
        mineflayerViewer(bot, { port: 1109 });
    });
}
main();