import { InferSelectModel } from "drizzle-orm";
import { players } from "../../db/schema.js"

type PlayerData = InferSelectModel<typeof players>;

export default PlayerData;