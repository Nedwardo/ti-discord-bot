import z from 'zod/v4';

export const StoredPlayerDataZod = z.object({
    name: z.string(),
    id: z.string()
})
type StoredPlayerData = {
    name: string;
    id: string;
}

export default StoredPlayerData;