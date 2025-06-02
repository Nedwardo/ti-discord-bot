import { GamePlayerStored } from './types/player_game_data.js';
import PlayerStats from './types/player_stats.js'
import {readFileSync} from 'fs'
import StoredPlayerData from './types/stored_player_data.js';

export default function get_player_stats(): PlayerStats[]{
    const player_to_id_map = new Map<string, string>();
    const player_games_map = new Map<string, number[]>();
    const player_stats: PlayerStats[] = [];

    read_players().forEach(player => {
        player_to_id_map.set(player.name, player.id)
    });

    read_game_players().forEach((game_player) => {
        if (!player_games_map.has(game_player.player)){
            player_games_map.set(game_player.player, [])
        }
        player_games_map.get(game_player.player)?.push(game_player.ranking)
    })

    player_games_map.forEach((positions_in_games, player_name) =>{
        if (!positions_in_games.length){
            return;
        }
        const player_id = player_to_id_map.get(player_name) ?? player_name
        if (!player_to_id_map.has(player_name)){
            console.log("Cannot find player id for player: " + player_name)
        }
        player_stats.push({
            player_id: player_id,
            average_placement: positions_in_games.reduce((l, r) => l + r) / positions_in_games.length,
            games_played: positions_in_games.length
        })
    
    })

    player_stats.sort((lhs, rhs) => {
        return lhs.average_placement - rhs.average_placement;
    })

    return player_stats
}

function read_players(): StoredPlayerData[]{
    const data = readFileSync('./data/players.json', 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as StoredPlayerData[]
}

function read_game_players(): GamePlayerStored[]{
    const data = readFileSync('./data/game_players.json', 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as GamePlayerStored[]
}