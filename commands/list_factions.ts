import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, SlashCommandBuilder } from 'discord.js';
import Command from '../utils/types/command.js';
import data from '../data/factions.json' with { type: 'json' };

const list_factions: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	command_metadata: new SlashCommandBuilder()
		.setName('list_factions')
		.setDescription('Lists all TI factions, including ds'),
	async execute(interaction) {
		console.log(data);
		await interaction.reply(build_list_faction_embedded(data));
	},
};

function build_list_faction_embedded(list_of_factions: {name: string, emoji: string}[]): InteractionReplyOptions{
	const embedded_message = new EmbedBuilder()
	embedded_message.setTitle("List of Factions")
	embedded_message.setDescription(list_of_factions.map((value => ":" + value.emoji + ": " + value.name)).join("\n"))

	return {
		embeds: [embedded_message]
	}
}


export default list_factions;
