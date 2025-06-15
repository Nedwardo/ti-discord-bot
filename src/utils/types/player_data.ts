import z from 'zod/v4';
import { RatingZod } from '../rating_system/skill_rating.js';

export const PlayerDataZod = z.object({
    name: z.string(),
    id: z.string(),
    rating: RatingZod
})
type PlayerData = z.infer<typeof PlayerDataZod>;

export default PlayerData;