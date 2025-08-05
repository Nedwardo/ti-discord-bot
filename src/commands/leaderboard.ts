import {SlashCommand} from '../utils/types/command.js';
import PlayerStats from '../utils/types/player_stats.js';
import generate_player_stats_array from '../utils/data_utils/player_stats_generator.js';
import { ApplicationCommandType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { get_all_game_player_data, get_all_players } from '../db/db_interactions.js';
import PlayerData from '../utils/types/player_data.js';

const leaderboard: SlashCommand = {
	admin_only_command: false,
	interaction_types: [InteractionType.ApplicationCommand],
	command_metadata: {
		name: 'leaderboard',
		description: 'Shows leaderboard of people\'s placement in TI games',
		type: ApplicationCommandType.ChatInput
	},
	async execute(_, db) {
		const player_data = await get_all_players(db)
		console.log("All players data: " + JSON.stringify(player_data))

		const game_player_data = await get_all_game_player_data(db)
		console.log("All game players data: " + JSON.stringify(game_player_data))
		const all_player_stats = generate_player_stats_array(player_data, game_player_data);
		all_player_stats.sort((lhs, rhs) => {
			return lhs.displayed_rating - rhs.displayed_rating;
		});
		all_player_stats.reverse();
		return {
			_tag: "Success",
			data: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: await build_ascii_leader_board(all_player_stats, player_data)
				}
			}
		}
	},
};

async function build_ascii_leader_board(all_player_stats: PlayerStats[], player_data: PlayerData[]): Promise<string> {
	console.log("Building ascii leaderboard")
	console.log("All player stats: " + JSON.stringify(all_player_stats) + "Player data: " + JSON.stringify(player_data))
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
	console.log("Iterating through all player stat to generate printable player stats")
	for (const player_stats of all_player_stats){
		const player = (player_data.filter(player => player.id == player_stats.player_id))[0];
		const name = player ? player.id : "Error on player id " + player_stats.player_id + "contact <@99778758059237376>"
		printable_player_stats.push({
			...player_stats,
			player_id: "<@" + name + ">",
			displayed_rating: Number(player_stats.displayed_rating.toFixed(2))
		});
	}
	console.log("Finished generating printable player stats")

	console.log("Iterating through columns to find max width of each column")
	const column_max_width = columns.map((column_name) => {
		const column_width = column_name.length

		const column_contents_width = printable_player_stats.map(
			player_stat => ("" + player_stat[column_to_property_mapping[column_name]]).length
		).reduce((previous_max_width, current_width) =>{
			return Math.max(previous_max_width, current_width)
		});

		return Math.max(column_width, column_contents_width, 0) + 2
	});
	console.log("Finished iterating through columns")

	console.log("Stringifying column row")
	const column_name_string = stringify_column_row(columns, column_max_width, column_separator)

	console.log("Generating spacer string")
	const spacer_string = header_separator.repeat(
		column_max_width.reduce((total_width, width) => total_width + width) +
		column_max_width.length - 1
	);

	console.log("Stringifying each player stats")
	const contents_string = printable_player_stats.map(
		(player_stats) => {
			const row_content: (string | number)[] = Object.values(player_stats);
			return stringify_column_row(row_content, column_max_width, column_separator);
		}
	).reduce((contents_string, row) => 
		contents_string + "\n" + row 
	);
	console.log("Finished stringifying")

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

