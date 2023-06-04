import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { join } from 'path';
import { ICommand, IEvent } from '../interfaces';
import glob from 'glob';
import config from '../config';

export default class VoidClient extends Client {
    public readonly config = config;
    public readonly commands: Collection<string, ICommand> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.MessageContent
            ]
        });
    };

    public async run(): Promise<void> {
        this
            .loadCommands()
            .loadEvents()
            .login(this.config.token)
            .then(() => {
                this.postCommands();
            });
    };

    public postCommands() {
        const rest = new REST({ version: '10' }).setToken(this.config.token);
        console.info('Started loading application (/) commands...');

        rest.put(Routes.applicationCommands(this.user.id), {
            body: this.commands.toJSON()
        }).then(() => {
            console.success(`Successfully loaded [${this.commands.size}] application (/) commands.`);
        }).catch(err => {
            console.error(err);
            process.exit(1);
        });

        return this;
    };

    private loadCommands(): VoidClient {
        glob('**/*.ts', { cwd: join(__dirname, '../commands') }, async (err, files) => {
            if (err) return console.error(err);
            if (files.length === 0) return console.warn('No commands were found in the commands file, this part is skipped..');

            files.forEach(async (file, i) => {
                const { Command }: { Command: ICommand } = await import(`../commands/${file}`);
                this.commands.set(Command.name, Command);
                if ((i + 1) === files.length) console.success(`Successfully loaded ${files.length} commands.`);
            });
        });

        return this;
    };

    private loadEvents(): VoidClient {
        glob('**/*.ts', { cwd: join(__dirname, '../events') }, async (err, files) => {
            if (err) return console.error(err);
            if (files.length === 0) return console.warn('No events were found in the events file, this part is skipped..');

            files.forEach(async (file, i) => {
                const { Event }: { Event: IEvent } = await import(`../events/${file}`);
                this.on(Event.name, Event.run.bind(null, this));
                if ((i + 1) === files.length) console.success(`Successfully loaded ${files.length} events.`);
            });
        });

        return this;
    };
};
