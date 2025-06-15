import { format, parse } from 'date-fns';
import z from 'zod/v4';

export type GameData = {
    game_id: string;
    game_date: Date;
    player_count: number;
    points_to_win: number;
}

export const StoredGameDataZod = z.object({
    game_id: z.string(),
    game_date: z.string(),
    player_count: z.number(),
    points_to_win: z.number()
})

export type StoredGameData = z.infer<typeof StoredGameDataZod>

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