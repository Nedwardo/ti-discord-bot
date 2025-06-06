import { User } from "discord.js";
import { z } from "zod/v4";

export const StoredGamePlayerDataZod = z.object({
    game_id: z.string(),
    player_id: z.string(),
    faction: z.string(),
    T0_speaker_order: z.number(),
    ranking: z.number(),
    points: z.number()
});
export type StoredGamePlayerData = z.infer<typeof StoredGamePlayerDataZod>

type GamePlayerData = {
    player: User;
    faction: string;
    T0_speaker_order: number;
    ranking: number;
    points: number;
}


export default GamePlayerData;