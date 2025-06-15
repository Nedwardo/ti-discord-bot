import z from 'zod/v4';

export const FactionZod = z.object({
    name: z.string(),
    emoji: z.string()
})
type Faction = z.infer<typeof FactionZod>;

export default Faction;