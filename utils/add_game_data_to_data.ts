import PlayerGameData from "./types/player_game_data.js";
import { v4 as uuid } from 'uuid';
import { StoredGameData, convert_game_data_to_stored_game_data, GameData } from "./types/stored_game_data.js";
import {writeFileSync, readFileSync} from 'fs'
// import { User } from "discord.js";
// import StoredPlayerData from "./types/stored_player_data.js";

function add_game_data_to_data(game: {player_data: PlayerGameData[], date: Date}): boolean {
    const game_id = uuid()
    const player_count = game.player_data.length
    const game_date = game.date
    add_new_game_to_data({game_id: game_id, player_count: player_count, game_date: game_date})
    // add_new_players_to_data(game.player_data.map(player_data => player_data.player))
    return true
}

function add_new_game_to_data(game_data: GameData): void {

    const data = readFileSync('../data/games.json', 'utf8')
    const existing_games = JSON.parse(data) as StoredGameData[]

    existing_games.push(convert_game_data_to_stored_game_data(game_data))

    writeFileSync('../data/games.json', JSON.stringify(existing_games, null, 4))
}

// function add_new_players_to_data(users: User[]): void{
    // const data = readFileSync('../data/games.json', 'utf8')
    // // const existing_players = JSON.parse(data) as StoredPlayerData[]

    // const users_as_stored_player_data: StoredPlayerData[] = users.map(user => {return {
    //     name: user.username,
    //     id: user.id
    // }});

    // users_as_stored_player_data.forEach( (value) => {
    //     if()
    // })

    // existing_games.push(convert_game_data_to_stored_game_data(game_data))

    // writeFileSync('../data/games.json', JSON.stringify(existing_games, null, 4))
// }

export default add_game_data_to_data;