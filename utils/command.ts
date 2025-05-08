import { SlashCommandBuilder } from 'discord.js';

export interface Command {
	data: SlashCommandBuilder,
	execute: (interaction: any) => void
}

export default Command;