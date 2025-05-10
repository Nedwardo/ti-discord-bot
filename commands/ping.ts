import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import Command from '../utils/types/command.js';

const ping: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	command_metadata: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};

export default ping;
