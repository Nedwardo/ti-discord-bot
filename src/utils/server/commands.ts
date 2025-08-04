import { Command } from '../types/command.js';
import add_admin_command from '../../commands/add_admin_command.js';
import leaderboard from '../../commands/leaderboard.js';
import list_factions from '../../commands/list_factions.js';
import submit_10_points_4_player_game from '../../commands/submit_10_points_4_player_game.js';
import submit_10_points_5_player_game from '../../commands/submit_10_points_5_player_game.js';
import submit_10_points_6_player_game from '../../commands/submit_10_points_6_player_game.js';
import submit_10_points_7_player_game from '../../commands/submit_10_points_7_player_game.js';
import submit_10_points_8_player_game from '../../commands/submit_10_points_8_player_game.js';
import submit_14_points_4_player_game from '../../commands/submit_14_points_4_player_game.js';
import submit_14_points_5_player_game from '../../commands/submit_14_points_5_player_game.js';
import submit_14_points_6_player_game from '../../commands/submit_14_points_6_player_game.js';
import submit_14_points_7_player_game from '../../commands/submit_14_points_7_player_game.js';
import submit_14_points_8_player_game from '../../commands/submit_14_points_8_player_game.js';

async function getCommands() {
	const commands = new Map<string, Command>([
		["add_new_admin", add_admin_command],
		["leaderboard", leaderboard],
		["list_factions", list_factions],
		["submit_10_points_4_player_game", submit_10_points_4_player_game],
		["submit_10_points_5_player_game", submit_10_points_5_player_game],
		["submit_10_points_6_player_game", submit_10_points_6_player_game],
		["submit_10_points_7_player_game", submit_10_points_7_player_game],
		["submit_10_points_8_player_game", submit_10_points_8_player_game],
		["submit_14_points_4_player_game", submit_14_points_4_player_game],
		["submit_14_points_5_player_game", submit_14_points_5_player_game],
		["submit_14_points_6_player_game", submit_14_points_6_player_game],
		["submit_14_points_7_player_game", submit_14_points_7_player_game],
		["submit_14_points_8_player_game", submit_14_points_8_player_game]
	]);
	return commands;
}


export default getCommands;