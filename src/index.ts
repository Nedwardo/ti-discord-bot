import { drizzle } from "drizzle-orm/d1";
import { handle_discord_commands } from "./utils/server/discord_command_manager.js";
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from "./db/schema.js"
interface ENV {
  db: D1Database;
  DISCORD_TOKEN: string;
}
export default {
  async fetch(request: Request, env: ENV) {
    const db = drizzle(env.db, {schema})

    const response = await handle_discord_commands(request, env.DISCORD_TOKEN, db);

    if (response._tag === "Success"){
      return new Response(JSON.stringify(response.data), {headers: { 'content-type': 'application/json' }})
    }

    console.error(response.error)
    return new Response(response.error, {headers: { 'content-type': 'application/text'}})
  }
};