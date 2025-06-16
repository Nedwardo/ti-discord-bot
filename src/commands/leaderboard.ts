import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {Command} from '../utils/types/command.js';
import PlayerStats from '../utils/types/player_stats.js';
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
			return lhs.displayed_rating - rhs.displayed_rating;
		});
		all_player_stats.reverse();
		await interaction.reply({
			content: build_ascii_leader_board(all_player_stats)
		});
	},
};

function build_ascii_leader_board(all_player_stats: PlayerStats[]): string {
	const columns = ["Name", "Rating", "Average Points", "Average Placement", "Games Played"] as const;
	const column_to_property_mapping: Record<typeof columns[number], keyof PlayerStats> ={
		"Name": "player_id",
		"Rating": "displayed_rating",
		"Average Points": "average_points",
		"Average Placement": "average_placement",
		"Games Played": "games_played"
	};
	const column_separator = "|";
	const header_separator = "-";

	var printable_player_stats: PlayerStats[] = []
	for (const player_stats of all_player_stats){
		const player_name_result = get_player_name_from_id(player_stats.player_id);
		if (player_name_result._tag === "Failure"){
			throw Error(player_name_result.error)
		}
		const player_name = player_name_result.data;
		printable_player_stats.push({
			...player_stats,
			player_id: player_name,
			displayed_rating: Number(player_stats.displayed_rating.toFixed(2))
		});
	}

	const column_max_width = columns.map((column_name) => {
		const column_width = column_name.length

		const column_contents_width = printable_player_stats.map(
			player_stat => ("" + player_stat[column_to_property_mapping[column_name]]).length
		).reduce((previous_max_width, current_width) =>{
			return Math.max(previous_max_width, current_width)
		});

		return Math.max(column_width, column_contents_width, 0) + 2
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


export default leaderboard;
