import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, rmSync } from 'fs'
import StoredPlayerData, { StoredPlayerDataZod } from "../types/stored_player_data.js"
import StoredGamePlayerStats, { StoredGamePlayerStatsZod } from "../types/stored_game_player_stats.js"
import { StoredGameData, StoredGameDataZod } from '../types/stored_game_data.js'
import Result from '../types/result.js'
import AdmZip from 'adm-zip'
import z from 'zod/v4'

const data_dir = "./data/";

const files = {
    admins: data_dir + 'admins.json',
    factions: data_dir + 'factions.json',
    games: data_dir + 'games.json',
    game_player_stats: data_dir + 'game_player_stats.json',
    players: data_dir + 'players.json',
}

export function read_admins(): string[]{
    const data = readFileSync(files.admins, 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as string[]
}

export function write_admins(admins: string[]): void{
    writeFileSync(files.admins, JSON.stringify(admins, null, 4))
}

export function read_factions(): string[]{
    const data = readFileSync(files.factions, 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as string[]
}

export function write_factions(factions: string[]): void{
    writeFileSync(files.factions, JSON.stringify(factions, null, 4))
}

export function read_games(): StoredGameData[]{
    const data = readFileSync(files.games, 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as StoredGameData[]
}

export function write_games(games: StoredGameData[]): void{
    writeFileSync(files.games, JSON.stringify(games, null, 4))
}


export function read_game_player_stats(): StoredGamePlayerStats[]{
    const data = readFileSync(files.game_player_stats, 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as StoredGamePlayerStats[]
}

export function write_game_player_stats(game_player_stats: StoredGamePlayerStats[]): void{
    writeFileSync(files.game_player_stats, JSON.stringify(game_player_stats, null, 4))
}

export function read_players(): StoredPlayerData[]{
    const data = readFileSync(files.players, 'utf8')
    const jsonContent = JSON.parse(data)

    return jsonContent as StoredPlayerData[]
}

export function write_players(players: StoredPlayerData[]): void{
    writeFileSync(files.players, JSON.stringify(players, null, 4))
}


export function dump_state_as_buffer(): Result<Buffer, string>{
    const validation_result = validate_stored_state()
    if (validation_result._tag === "Failure") return validation_result;

    const zip = new AdmZip();

    Object.values(files).forEach(path => zip.addLocalFile(path))

    return {
        _tag: "Success",
        data: zip.toBuffer()
    }
}

export function load_state_from_buffer(zip_file_buffer: Buffer): Result<null, string>{
    var zip: AdmZip;
    try{
        zip = new AdmZip(zip_file_buffer);
    } catch (error){
        var error_string = ""
        if (error instanceof String) error_string = error.toString()
        if (typeof error === "string") error_string = error

        if (error_string !== ""){
            return {
                _tag: "Failure",
                error: error_string
            }
        }
        throw error
    }

    const temporary_data_dir = "./old_data/"
    if (!existsSync(temporary_data_dir)){
        mkdirSync(temporary_data_dir);
    }

    Object.values(files).forEach(path => renameSync(path, path.replace(data_dir, temporary_data_dir)))

    zip.extractAllTo(data_dir)
    const validation_result = validate_stored_state()
    if (validation_result._tag === "Failure"){
        Object.values(files).forEach(path => unlinkSync(path))
        Object.values(files).forEach(path => renameSync(path.replace(data_dir, temporary_data_dir), path))
        rmSync(temporary_data_dir, { recursive: true, force: true });
        return validation_result;
    }

    rmSync(temporary_data_dir, { recursive: true, force: true });
    return {
        _tag: "Success",
        data: null
    };
}

export function validate_stored_state(): Result<null, string>{
    const failures = new Map<String, z.ZodError>();
    const admin_result = validate_json_is_list_of_object(files.admins, z.string());
    if (admin_result._tag === "Failure") { failures.set(files.admins, admin_result.error) };

    const factions_result = validate_json_is_list_of_object(files.factions, z.string());
    if (factions_result._tag === "Failure") { failures.set(files.factions, factions_result.error) };

    const games_result = validate_json_is_list_of_object(files.games, StoredGameDataZod);
    if (games_result._tag === "Failure") { failures.set(files.games, games_result.error) };

    const game_player_stats_result = validate_json_is_list_of_object(files.game_player_stats, StoredGamePlayerStatsZod);
    if (game_player_stats_result._tag === "Failure") { failures.set(files.game_player_stats, game_player_stats_result.error) };

    const players_result = validate_json_is_list_of_object(files.players, StoredPlayerDataZod);
    if (players_result._tag === "Failure") { failures.set(files.players, players_result.error) };


    if ( Object.keys(failures).length === 0 ){
        return {
            _tag: "Success",
            data: null
        }
    }

    var error_message = ""
    failures.forEach((value, key) =>{
        error_message += "file: " + key + "gave error:\n" + value.issues +"\n"
    });

    return {
        _tag: "Failure",
        error: error_message
    }

}

function validate_json_is_list_of_object(path: string, type: z.ZodObject |  z.ZodString): Result<null, z.ZodError>{
    const data = readFileSync(path, 'utf8')
    const jsonContent = JSON.parse(data)

    const schema = z.array(type)

    try {
        schema.parse(jsonContent);
    } catch (error) {
        return {
            _tag: 'Failure',
            error: error as z.ZodError
        }
    }
    
    return {
        _tag: "Success",
        data: null
    }
}