import { InferSelectModel } from "drizzle-orm";
import { game_player_stats } from "../../db/schema.js"

export type StoredGamePlayerData = InferSelectModel<typeof game_player_stats>

type GamePlayerData = {
    player: User;
    faction: string;
    t0_speaker_order: number;
    ranking: number;
    points: number;
}

export type User = {
    username: string,
    id: string
}


export default GamePlayerData;