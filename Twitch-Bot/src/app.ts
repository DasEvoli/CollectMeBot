import dotenv from 'dotenv';
dotenv.config();
import { client as WebSocketClient } from 'websocket';
import Bot from './entities/Bot';
import Context from './entities/Context';

const client = new WebSocketClient(); // Connects at the bottom of the file

client.on('connectFailed', function(error: any) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection: any) {
    const bot = Bot.getInstance(connection);
    bot.readFileAndAddNewChannels();

    connection.on('error', function(error: any) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('message', function(message: any) {
        try {
            if (message.type === 'utf8') {
                if (message.utf8Data.startsWith('PING')) {
                    Bot.getInstance().sendPong();
                }
                if (message.utf8Data.includes('PRIVMSG')) {
                    const ctx = Context.createContextFromRawMessage(message.utf8Data);
                    console.log(`MESSAGE: ${ctx.user.displayName}: ${ctx.message.content}`);
                    if (ctx.command) {
                        console.log(`COMMAND: ${ctx.user.displayName} executed ${ctx.command.name}`)
                        ctx.command.execute(ctx);
                    }
                }
            }
        } catch(error) {
            console.log("An error occured while processing a message.");
            console.log(error);
        }
    });

    connection.on('close', function() {
        console.log('Connection Closed');
    });

});

client.connect('wss://irc-ws.chat.twitch.tv:443/', 'irc');