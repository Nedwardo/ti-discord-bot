import { display_rating } from '../rating_system/skill_rating.js';
import PlayerData from '../types/player_data.js';
import PlayerStats, { PlayerGameStats } from '../types/player_stats.js'
import { data } from './persistent_store.js';

export default function get_player_stats(): PlayerStats[]{
    const player_games_map = new Map<string, PlayerGameStats[]>();
    const player_stats: PlayerStats[] = [];
    const player_data = data.players.get();

    data.game_player_data.get().forEach((game_player_stats) => {
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

    player_games_map.forEach((positions_in_games, player_id) =>{
        const player = player_data.filter((a_player) => a_player.id === player_id)[0] as PlayerData;
        player_stats.push({
            player_id: player_id,
            displayed_rating: display_rating(player.rating),
            average_points: positions_in_games.map(value => value.average_points).reduce((l, r) => l + r) / positions_in_games.length,
            average_placement: positions_in_games.map(value => value.average_placement).reduce((l, r) => l + r) / positions_in_games.length,
            games_played: positions_in_games.length
        })
    })
    return player_stats
}