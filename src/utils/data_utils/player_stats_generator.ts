import { display_rating } from '../rating_system/skill_rating.js';
import { StoredGamePlayerData } from '../types/game_player_data.js';
import PlayerData from '../types/player_data.js';
import PlayerStats, { PlayerGameStats } from '../types/player_stats.js'

export default function generate_player_stats_array(player_data: PlayerData[], game_player_data: StoredGamePlayerData[]): PlayerStats[]{
    console.log("Getting all player's stats")
    const player_games_map = new Map<string, PlayerGameStats[]>();
    const player_stats: PlayerStats[] = [];

    console.log("Building player games map")
    game_player_data.forEach((game_player_stats) => {
            if (!player_games_map.has(game_player_stats.player_id)){
                player_games_map.set(game_player_stats.player_id, [])
            }
            player_games_map.get(game_player_stats.player_id)?.push(
                {
                    player_id: game_player_stats.player_id,
                    average_points: game_player_stats.points,
                    average_placement: game_player_stats.ranking,
                    games_played: 1
                });
    })
    console.log("Finished building player games map")

    console.log("Building player stats array")
    player_games_map.forEach((positions_in_games, player_id) =>{
        const player = player_data.filter((a_player) => a_player.id === player_id)[0];
        if (!player){
            throw new Error("Should be unreachable given above? Found during player games map iteration")
        }
        player_stats.push({
            player_id: player_id,
            displayed_rating: display_rating({mu: player.rating_mu, sigma: player.rating_sigma}),
            average_points: positions_in_games.map(value => value.average_points).reduce((l, r) => l + r) / positions_in_games.length,
            average_placement: positions_in_games.map(value => value.average_placement).reduce((l, r) => l + r) / positions_in_games.length,
            games_played: positions_in_games.length
        })
    })
    console.log("Finished building player stats array")
    return player_stats
}