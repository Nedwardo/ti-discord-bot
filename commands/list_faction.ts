import { SlashCommandBuilder } from 'discord.js';
import Command from '../utils/command.js';
import data from '../data/factions.json' with { type: 'json' };

const list_faction: Command = {
	data: new SlashCommandBuilder()
		.setName('list_faction')
		.setDescription('Lists all TI factions, including ds'),
	async execute(interaction: any) {
        console.log(data)
		await interaction.reply("" + data);
	},
};

export default list_faction;
