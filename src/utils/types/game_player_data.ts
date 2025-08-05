import { InferSelectModel } from "drizzle-orm";
import { game_player_stats } from "../../db/schema.js"

export type StoredGamePlayerData = InferSelectModel<typeof game_player_stats>

type GamePlayerData = {
    player_id: string;
    faction: string;
    t0_speaker_order: number;
    ranking: number;
    points: number;
}

export default GamePlayerData;