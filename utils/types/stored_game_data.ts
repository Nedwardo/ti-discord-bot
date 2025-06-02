import { format, parse } from 'date-fns';

export type GameData = {
    game_id: string;
    game_date: Date;
    player_count: Number;
}


export type StoredGameData = {
    game_id: string;
    game_date: string;
    player_count: Number;
}

const date_format = "dd/MM/yyy"

export function convert_game_data_to_stored_game_data(game_data: GameData) : StoredGameData{
    return {
        ...game_data,
        game_date: format(game_data.game_date, date_format)
    }
}

export function convert_stored_game_data_to_game_data(stored_game_data: StoredGameData) : GameData{
    return {
        ...stored_game_data,
        game_date: parse(stored_game_data.game_date, date_format, Date())
    }
    
}