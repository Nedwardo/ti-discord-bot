import { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema.js'
import Faction from '../utils/types/faction.js'
import PlayerData from '../utils/types/player_data.js'
import GamePlayerData, { StoredGamePlayerData } from '../utils/types/game_player_data.js'
import { v4 as uuid } from 'uuid';
import type { D1Result } from '@cloudflare/workers-types';
import { inArray } from 'drizzle-orm'
import { convert_game_data_to_stored_game_data, StoredGameData } from '../utils/types/game_data.js'
import RatingSystem, { Rating } from '../utils/rating_system/skill_rating.js'
export type DB = DrizzleD1Database<typeof schema>

export async function is_admin(id: string, db: DB): Promise<boolean>{
    console.log("Looking up if " + id + " is admin");
    console.log(await db.query.admins.findFirst({where: (admins, { eq }) => eq(admins.id, id)}))
    return !!(await db.query.admins.findFirst({where: (admins, { eq }) => eq(admins.id, id)}))
}

export function add_admin(id: string, db: DB): Promise<D1Result> {
    return db.insert(schema.admins).values({id: id}).run()
}

export function get_all_factions(db: DB): Promise<Faction[]>{
    return db.select().from(schema.factions).all()
}

export async function get_all_players(db: DB): Promise<PlayerData[]>{
    console.log("Getting player list from db")
    return db.select().from(schema.players).all()
}
export async function get_player_data_from_id(id: string, db: DB): Promise<PlayerData | undefined>{
    return db.query.players.findFirst({with: {id: id}})
}
async function store_new_players(players: PlayerData[], db: DB): Promise<D1Result | void>{
    if (players.length === 0){
        return
    }
    console.log("Storing players in db: " + JSON.stringify(players))
    return db.insert(schema.players).values(players).run();
}
async function update_players(players: PlayerData[], db: DB): Promise<D1Result | void>{
    if (players.length === 0){
        return
    }
    db.delete(schema.players).where(inArray(schema.players.id, players.map(player => player.id)))
    return store_new_players(players, db);
}

export function get_all_game_player_data(db: DB): Promise<StoredGamePlayerData[]>{
    return db.select().from(schema.game_player_stats).all()
}
function store_new_game_player_data(game_player_data: StoredGamePlayerData[], db: DB): Promise<D1Result>{
    return db.insert(schema.game_player_stats).values(game_player_data)
}

function store_game(game_data: StoredGameData, db: DB): Promise<D1Result> {
    console.log("Storing game data into games table")
    return db.insert(schema.games).values(game_data).run()
}

export async function store_game_data(game: {player_data: GamePlayerData[], date: Date, points_to_win: number}, db: DB): Promise<void> {
    console.log("Storing players data")
    const game_id = uuid()

    const players = await get_all_players(db);
    console.log("Players from db:\n" + JSON.stringify(players));

    const player_ratings = update_player_ratings(players, game.player_data);

    const stored_game_data = convert_game_data_to_stored_game_data({
        game_date: game.date,
        player_count: game.player_data.length,
        points_to_win: game.points_to_win,
        game_id: game_id,
    })
    console.log("Storing game data:\n" + JSON.stringify(stored_game_data))
    var result: D1Result | (D1Result | void)[]

    result = await store_game(stored_game_data, db)
    console.log("Result of storing game data: " + JSON.stringify(result))

    result = await store_and_update_new_players(players, game.player_data.map(player_data => player_data.player_id), player_ratings, db)
    console.log("Result of storing new player data: " + result)

    result = await store_game_player_stats(await get_all_game_player_data(db), game_id, game.player_data, db)
    console.log("Result of storing new game player stats data: " + result)
}

function update_player_ratings(players: PlayerData[], player_data: GamePlayerData[]): Rating[] {
    const existing_id_to_index_map = new Map<string, number>();
    const rating_system = new RatingSystem();

    players.forEach((existing_player, index) => {
        existing_id_to_index_map.set(existing_player.id, index)
    })

    const ratings = player_data.map((player_datas) => {
        const stored_index = existing_id_to_index_map.get(player_datas.player_id.id);
        if(stored_index !== undefined && players[stored_index]){
            return {
                mu: players[stored_index].rating_mu,
                sigma: players[stored_index].rating_sigma
            }
        }
        return rating_system.new_rating();
    })

    const placings = player_data.map((player_datas) => player_datas.ranking)


    return rating_system.update_player_rankings(ratings, placings)
}

function store_and_update_new_players(players: PlayerData[], reported_players: string[], player_ratings: Rating[], db: DB): Promise<(D1Result | void)[]>{
    console.log("Storing and updating new players")
    console.log("Reported players: " + JSON.stringify(reported_players))
    const new_players: PlayerData[] = [];
    const players_to_update: PlayerData[] = [];

    const existing_player_ids = players.map(player => player.id)

    reported_players.forEach((player_id, current_index) => {
        const rating = player_ratings[current_index] as Rating
        const updated_stats = {
            id: player_id,
            rating_mu: rating.mu,
            rating_sigma: rating.sigma
        }
        if (existing_player_ids.includes(player_id.id)){
            players_to_update.push(updated_stats)
        }
        else{
            new_players.push(updated_stats)
        }
    })
    console.log("New players " + JSON.stringify(new_players))
    console.log("Updated players " + JSON.stringify(players_to_update))
    return Promise.all([store_new_players(new_players, db), update_players(players_to_update, db)]);
}

function store_game_player_stats(existing_player_data: StoredGamePlayerData[], game_id: string, player_data: GamePlayerData[], db: DB): Promise<D1Result>{
    const new_player_stats = player_data.map(({player_id: player_id, ...rest}) => ({
        ...rest,
        game_id: game_id,
        player_id: player_id.id
    })) as StoredGamePlayerData[];

    const player_stats = [...existing_player_data, ...new_player_stats]

    return store_new_game_player_data(player_stats, db)
}