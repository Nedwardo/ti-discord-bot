import { SlashCommand } from '../utils/types/command.js';
import Faction from '../utils/types/faction.js';
import { APIInteractionResponse, ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { get_all_factions } from '../db/db_interactions.js';

const list_factions: SlashCommand = {
	admin_only_command: false,
	interaction_types: [InteractionType.ApplicationCommand],
	command_metadata: {
		name: 'list_factions',
		description: 'Lists all TI factions, including ds',
		type: ApplicationCommandType.ChatInput
	},
	async execute(_, db) {
		return {
			_tag: "Success",
			data: build_list_faction_embedded(await get_all_factions(db))
		};
	},
};

function build_list_faction_embedded(list_of_factions: Faction[]): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [{
				title: "List of Factions",
				description: list_of_factions.map((value => ":" + value.emoji + ": " + value.name)).join("\n")
			}]
		}
	}
}


export default list_factions;
