import PlayerStats from '../types/player_stats.js'
import { read_game_player_stats } from './persistent_store.js';

export default function get_player_stats(): PlayerStats[]{
    const player_games_map = new Map<string, PlayerStats[]>();
    const player_stats: PlayerStats[] = [];

    read_game_player_stats().forEach((game_player) => {
        if (!player_games_map.has(game_player.player_id)){
            player_games_map.set(game_player.player_id, [])
        }
        player_games_map.get(game_player.player_id)?.push(
            {
                player_id: game_player.player_id,
                average_points: game_player.points,
                average_placement: game_player.ranking,
                games_played: 1
            });
    })

    player_games_map.forEach((positions_in_games, player_id) =>{
        player_stats.push({
            player_id: player_id,
            average_points: positions_in_games.map(value => value.average_points).reduce((l, r) => l + r) / positions_in_games.length,
            average_placement: positions_in_games.map(value => value.average_placement).reduce((l, r) => l + r) / positions_in_games.length,
            games_played: positions_in_games.length
        })
    })

    player_stats.sort((lhs, rhs) => {
        return lhs.average_points - rhs.average_points;
    })

    return player_stats
}