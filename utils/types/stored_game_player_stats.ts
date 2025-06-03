
import z from 'zod/v4';

export const StoredGamePlayerStatsZod = z.object({
    game_id: z.string(),
    player_id: z.string(),
    faction: z.string(),
    T0_speaker_order: z.number(),
    ranking: z.number(),
    points: z.number()

})

type StoredGamePlayerStats = z.infer<typeof StoredGamePlayerStatsZod>

export default StoredGamePlayerStats;