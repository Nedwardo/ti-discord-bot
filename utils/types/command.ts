import { AutocompleteInteraction, Interaction, SlashCommandOptionsOnlyBuilder } from 'discord.js';

export type Command<T extends Interaction> = {
	interaction_type_checker: (interaction: Interaction) => boolean,
	admin_only_command: boolean,
	command_metadata: SlashCommandOptionsOnlyBuilder,
	execute: (interaction: T) => void
}
export type AutoCompleteCommand<T extends Interaction> = Command<T> & {
	auto_complete_update: (interaction: AutocompleteInteraction) => void;
};