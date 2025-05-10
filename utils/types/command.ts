import { Interaction, SlashCommandBuilder } from 'discord.js';

export default interface Command<T extends Interaction> {
	interaction_type_checker: (interaction: Interaction) => boolean
	command_metadata: SlashCommandBuilder,
	execute: (interaction: T) => void
}