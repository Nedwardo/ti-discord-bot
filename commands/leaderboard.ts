import { ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import PlayerStats from '../utils/types/player_stats.js';
import get_player_stats from '../utils/data_utils/player_stats_generator.js';

const leaderboard: Command<ChatInputCommandInteraction> = {
	interaction_type_checker: (interaction) => interaction.isChatInputCommand(),
	admin_only_command: false,
	command_metadata: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows leaderboard of people\'s placement in TI games'),
	async execute(interaction) {
		const all_player_stats = get_player_stats();
		all_player_stats.sort((lhs, rhs) => {
			return lhs.average_points - rhs.average_points;
		});
		all_player_stats.reverse();
		await interaction.reply(build_leaderboard_embedded(all_player_stats));
	},
};

function build_ascii_leader_board(all_player_stats: PlayerStats[]): string {
	columns = ["Name", "Average Points", "Average Placement", "Games Played"];
}
// function build_leaderboard_embedded(all_player_stats: PlayerStats[]): InteractionReplyOptions {
// 	// Commented out as you can only have 3 in line columns for some stupid reason
	// all_player_stats.sort((lhs, rhs) => {
	// 	return lhs.average_points - rhs.average_points;
	// });
	// all_player_stats.reverse();
// 	const embedded_message = new EmbedBuilder()
// 	embedded_message.setTitle("Anti Ellie Propaganda Enthusiasts Leaderboard")
// 	embedded_message.addFields(
// 		{ name: "Name", value: all_player_stats.map((value) => "<@" + value.player_id + ">").join("\n"), inline: true },
// 		{ name: "Average Points", value: all_player_stats.map((value) => value.average_points).join("\n"), inline: true },
// 		{ name: "Average Placement", value: all_player_stats.map((value) => value.average_placement).join("\n"), inline: true },
// 		{ name: "Games Played", value: all_player_stats.map((value) => value.games_played).join("\n"), inline: true },
// 	)

// 	return {
// 		embeds: [embedded_message]
// 	}
// }


export default leaderboard;
