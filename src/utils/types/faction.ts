import { InferSelectModel } from "drizzle-orm";
import { factions } from "../../db/schema.js"

type Faction = InferSelectModel<typeof factions>;

export default Faction;