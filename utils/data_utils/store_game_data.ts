import GamePlayerData, { StoredGamePlayerData } from "../types/game_player_data.js";
import { v4 as uuid } from 'uuid';
import { convert_game_data_to_stored_game_data, GameData } from "../types/game_data.js";
import { User } from "discord.js";
import data from "./persistent_store.js";

function store_game_data(game: {player_data: GamePlayerData[], date: Date}): void {
    const game_id = uuid()
    const player_count = game.player_data.length
    const game_date = game.date
    store_game({game_id: game_id, player_count: player_count, game_date: game_date})
    store_new_players(game.player_data.map(player_data => player_data.player))
    store_game_player_stats(game_id, game.player_data)
}

function store_game(game_data: GameData): void {
    data.games.add(convert_game_data_to_stored_game_data(game_data))
}

function store_new_players(users: User[]): void{
    var players = data.players.get();

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

    data.players.set(players)
}

function store_game_player_stats(game_id: string, player_data: GamePlayerData[]): void{
    var existing_player_data = data.game_player_data.get()

    const new_player_stats = player_data.map(({player: player_id, ...rest}) => ({
        ...rest,
        game_id: game_id,
        player_id: player_id.id
    })) as StoredGamePlayerData[];

    const player_stats = [...existing_player_data, ...new_player_stats]

    data.game_player_data.set(player_stats)
}

export default store_game_data;