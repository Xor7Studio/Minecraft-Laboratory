const net = require("net");
const projectConfig = require("./projectConfig");
const fs = require("fs");
const { Worker, isMainThread, parentPort } = require("worker_threads");

if (isMainThread) {
    let on = true;
    // let close = () => {
    // };

    const separateThread = new Worker(__filename);

    function getTime() {
        return Date.now();
    }

    function getTime4Log() {
        return (date => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`)(new Date());
    }

    function main() {
        const config = projectConfig;
        const server = net.createServer((client) => {
            console.info(`[${getTime4Log()}] [INFO] - TCP Client connect ${client.remoteAddress}:${client.remotePort}`);
            fs.writeFileSync(`./data/${client.remotePort}.csv`, `time,byte\n`);
            const log = byte => separateThread.postMessage([`./data/${client.remotePort}.csv`, `${getTime()},${byte}\n`]);
            const gameServer = net.connect({ host: config.gameHost, port: config.gamePort }, () => {
                console.info(`[${getTime4Log()}] [INFO] - TCP Server connected`);
            });
            gameServer.on("data", function(chunk) {
                log(chunk.length);
                client.write(chunk);
            });
            client.on("data", function(chunk) {
                log(chunk.length);
                gameServer.write(chunk);
            });
            client.on("end", () => {
                console.info(`[${getTime4Log()}] [INFO] - TCP Client ${client.remoteAddress}:${client.remotePort} disconnect`);
                gameServer.end();
            });
            gameServer.on("end", () => {
                console.info(`[${getTime4Log()}] [INFO] - TCP Server disconnected`);
                client.end();
            });
            client.on("error", () => {
                client.end();
                gameServer.end();
            });
            gameServer.on("error", () => {
                client.end();
                gameServer.end();
            });
            // close = () => {
            //     client.end();
            //     gameServer.end();
            // };
        });
        server.listen({ host: config.forwardHost, port: config.forwardPort });
        return server;
    }

    try {
        fs.mkdirSync("./data");
    } catch {
    }

    const server = main();


    const read = () => {
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question(`>`, stop => {
            if (stop === "stop") {
                on = false;
            }
            readline.close();
        });
        readline.on("close", () => {
            if (on) {
                read();
            } else {
                server.close();
                // close();
                console.log(`[${getTime4Log()}] [INFO] - Server closed.`);
            }
        });
    };

    read();
} else {

    parentPort.on("message", (value) => {
        fs.appendFile(value[0], value[1], () => {
        });
    });
}