import GamePlayerData, { StoredGamePlayerData } from "../types/game_player_data.js";
import { v4 as uuid } from 'uuid';
import { convert_game_data_to_stored_game_data, GameData } from "../types/game_data.js";
import { User } from "discord.js";
import data from "./persistent_store.js";
import { Rating } from "../rating_system/skill_rating.js";
import rating_system from "../../systems/skill_rating_system.js";

function store_game_data(game: {player_data: GamePlayerData[], date: Date, points_to_win: number}): void {
    const game_id = uuid()
    const player_ratings = update_player_ratings(game.player_data);
    store_game({game_id: game_id, player_count: game.player_data.length, game_date: game.date, points_to_win: game.points_to_win})
    store_new_players(game.player_data.map(player_data => player_data.player), player_ratings)
    store_game_player_stats(game_id, game.player_data)
}

function update_player_ratings(player_data: GamePlayerData[]): Rating[] {
    const players = data.players.get();

    const existing_id_to_index_map = new Map<string, number>();
    players.forEach((existing_player, index) => {
        existing_id_to_index_map.set(existing_player.id, index)
    })

    const ratings = player_data.map((player_datas) => {
        const stored_index = existing_id_to_index_map.get(player_datas.player.id);
        if(stored_index !== undefined && players[stored_index]){
            return players[stored_index].rating
        }
        return rating_system.new_rating();
    })

    const placings = player_data.map((player_datas) => player_datas.ranking)


    return rating_system.update_player_rankings(ratings, placings)
}

function store_game(game_data: GameData): void {
    data.games.add(convert_game_data_to_stored_game_data(game_data))
}

function store_new_players(users: User[], player_ratings: Rating[]): void{
    var players = data.players.get();

    const existing_id_to_index_map = new Map<string, number>();
    players.forEach((existing_player, index) => {
        existing_id_to_index_map.set(existing_player.id, index)
    })

    users.forEach((user, current_index) => {
        const stored_index = existing_id_to_index_map.get(user.id);
        if(stored_index !== undefined && players[stored_index]){
            players[stored_index].name = user.username
            players[stored_index].rating = player_ratings[current_index] as Rating
        }
        else{
            players.push({
                name: user.username,
                id: user.id,
                rating: player_ratings[current_index] as Rating
            })
        }
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