import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, SlashCommandBuilder } from 'discord.js';
import { Command } from '../utils/types/command.js';
import data from '../utils/data_utils/persistent_store.js';
import Faction from '../utils/types/faction.js';

const list_factions: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	admin_only_command: false,
	command_metadata: new SlashCommandBuilder()
		.setName('list_factions')
		.setDescription('Lists all TI factions, including ds'),
	async execute(interaction) {
		await interaction.reply(build_list_faction_embedded(data.factions.get()));
	},
};

function build_list_faction_embedded(list_of_factions: Faction[]): InteractionReplyOptions {
	const embedded_message = new EmbedBuilder()
	embedded_message.setTitle("List of Factions")
	embedded_message.setDescription(list_of_factions.map((value => ":" + value.emoji + ": " + value.name)).join("\n"))

	return {
		embeds: [embedded_message]
	}
}


export default list_factions;
