import z from 'zod/v4';

export const PlayerDataZod = z.object({
    name: z.string(),
    id: z.string()
})
type PlayerData = z.infer<typeof PlayerDataZod>;

export default PlayerData;