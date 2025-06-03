import PlayerGameData from "../types/player_game_data.js";
import { v4 as uuid } from 'uuid';
import { convert_game_data_to_stored_game_data, GameData } from "../types/stored_game_data.js";
import { User } from "discord.js";
import { read_game_player_stats, read_games, read_players, write_game_player_stats, write_games, write_players } from "./persistent_store.js";

function store_game_data(game: {player_data: PlayerGameData[], date: Date}): void {
    const game_id = uuid()
    const player_count = game.player_data.length
    const game_date = game.date
    store_game({game_id: game_id, player_count: player_count, game_date: game_date})
    store_new_players(game.player_data.map(player_data => player_data.player))
    store_game_player_stats(game_id, game.player_data)
}

function store_game(game_data: GameData): void {
    const existing_games = read_games();

    existing_games.push(convert_game_data_to_stored_game_data(game_data))

    write_games(existing_games)
}

function store_new_players(users: User[]): void{
    var players = read_players();

    const existing_id_to_index_map = new Map<string, number>();
    players.forEach((existing_player, index) => {
        existing_id_to_index_map.set(existing_player.id, index)
    })

    users.forEach((user) => {
        const index = existing_id_to_index_map.get(user.id);
        if(index !== undefined && players[index]){
            players[index].name = user.username
            return
        }
        players.push({
            name: user.username,
            id: user.id
        })
    })

    players = players.sort((a, b) => a.name > b.name ? 1 : -1 )

    write_players(players)
}

function store_game_player_stats(game_id: string, player_data: PlayerGameData[]): void{
    var existing_player_stats = read_game_player_stats();

    const new_player_stats= player_data.map(({player, ...rest}) => ({
        ...rest,
        game_id: game_id,
        player_id: player.id
    }))

    const player_stats = [...existing_player_stats, ...new_player_stats]

    write_game_player_stats(player_stats)
}

export default store_game_data;