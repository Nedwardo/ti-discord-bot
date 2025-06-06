import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import PlayerData from '../utils/types/player_stats.js';
import get_player_stats from '../utils/data_utils/player_stats_generator.js';
import get_player_name_from_id from '../utils/data_utils/get_player_name_from_id.js';

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
		await interaction.reply({
			content: build_ascii_leader_board(all_player_stats)
		});
	},
};

function build_ascii_leader_board(all_player_stats: PlayerData[]): string {
	const columns = ["Name", "Average Points", "Average Placement", "Games Played"] as const;
	const column_to_property_mapping: Record<typeof columns[number], keyof PlayerData> ={
		"Name": "player_id",
		"Average Points": "average_points",
		"Average Placement": "average_placement",
		"Games Played": "games_played"
	};
	const column_separator = "|";
	const header_separator = "-";

	all_player_stats.sort((lhs, rhs) => {
		const points_diff = rhs.average_points - lhs.average_points
		if (points_diff !== 0){
			return points_diff
		}
		return lhs.average_placement - rhs.average_placement
	})

	var printable_player_stats: PlayerData[] = []
	for (const player_stats of all_player_stats){
		const player_name_result = get_player_name_from_id(player_stats.player_id);
		if (player_name_result._tag === "Failure"){
			throw Error(player_name_result.error)
		}
		const player_name = player_name_result.data;
		printable_player_stats.push({
			...player_stats,
			player_id: player_name
		});
	}

	const column_max_width = columns.map((column_name) => {
		const column_width = column_name.length

		const column_contents_width = printable_player_stats.map(
			player_stat => ("" + player_stat[column_to_property_mapping[column_name]]).length
		).reduce((previous_max_width, current_width) =>{
			return Math.max(previous_max_width, current_width)
		});

		return Math.max(column_width, column_contents_width) + 2
	});

	const column_name_string = stringify_column_row(columns, column_max_width, column_separator)

	const spacer_string = header_separator.repeat(
		column_max_width.reduce((total_width, width) => total_width + width) +
		column_max_width.length - 1
	);

	const contents_string = printable_player_stats.map(
		(player_stats) => {
			const row_content: (string | number)[] = Object.values(player_stats);
			return stringify_column_row(row_content, column_max_width, column_separator);
		}
	).reduce((contents_string, row) => 
		contents_string + "\n" + row 
	);

	return "```" + column_name_string + "\n" + spacer_string + "\n" + contents_string + "```"
}

function stringify_column_row(row_as_list: readonly (string | number)[], expected_column_widths: number[], column_separator: string): string{
	return row_as_list.map((text, index) => {
		const column_width = expected_column_widths[index];
		if (!column_width) {throw Error("How???")}
		const unused_space = column_width - ("" + text).length;
		const left_space = Math.floor(unused_space / 2);
		const right_space = unused_space - left_space;

		return " ".repeat(left_space) + text + " ".repeat(right_space);
	}).reduce((accumulator, currentValue) => 
		accumulator + column_separator + currentValue
	);
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
