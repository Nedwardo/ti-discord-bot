import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const admins = sqliteTable("admins", {
	id: text().primaryKey().notNull(),
});

export const factions = sqliteTable("factions", {
	name: text().primaryKey().notNull(),
	emoji: text().notNull(),
});

export const game_player_stats = sqliteTable("game_player_stats", {
	game_id: text("game_id").notNull(),
	player_id: text("player_id").notNull(),
	faction: text().notNull(),
	t0_speaker_order: integer("T0_speaker_order").notNull(),
	ranking: integer().notNull(),
	points: integer().notNull(),
});

export const games = sqliteTable("games", {
	game_id: text("game_id").primaryKey().notNull(),
	game_date: text("game_date").notNull(),
	player_count: integer("player_count").notNull(),
	points_to_win: integer("points_to_win").notNull(),
});

export const players = sqliteTable("players", {
	name: text().notNull(),
	id: text().primaryKey().notNull(),
	rating_mu: integer("rating_mu").notNull(),
	rating_sigma: integer("rating_sigma").notNull(),
});

