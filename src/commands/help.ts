import { ICommand } from '../interfaces';

export const Command: ICommand = {
    name: 'help',
    description: 'Displays a list of commands or information about a specific command.',
    options: [],
    run: async (client, interaction) => {
        return interaction.reply('This command is not yet implemented.');
    }
};