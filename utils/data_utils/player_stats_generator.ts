import PlayerStats from '../types/player_stats.js'
import { read_game_player_stats } from './persistent_store.js';

export default function get_player_stats(): PlayerStats[]{
    const player_games_map = new Map<string, number[]>();
    const player_stats: PlayerStats[] = [];

    read_game_player_stats().forEach((game_player) => {
        if (!player_games_map.has(game_player.player_id)){
            player_games_map.set(game_player.player_id, [])
        }
        player_games_map.get(game_player.player_id)?.push(game_player.ranking)
    })

    player_games_map.forEach((positions_in_games, player_id) =>{
        player_stats.push({
            player_id: player_id,
            average_placement: positions_in_games.reduce((l, r) => l + r) / positions_in_games.length,
            games_played: positions_in_games.length
        })
    })

    player_stats.sort((lhs, rhs) => {
        return lhs.average_placement - rhs.average_placement;
    })
    console.log(player_stats)

    return player_stats
}