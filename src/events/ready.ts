import { Client } from "discord.js";

export default {
    name: 'ready',
    run: (client) => {
        console.success(`Logged in as ${client.user.tag}!`);
        client.user.setActivity({
            name: 'your eyes',
            type: 'WATCHING'
        });
    }
}