const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
function main(){
    const bot = mineflayer.createBot({
        host: 'localhost',
        port: 25565,
        username: 'Bot'
    });
    bot.once('spawn', () => {
        mineflayerViewer(bot, { port: 1109 });
    });
}
main();