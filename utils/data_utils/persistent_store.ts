import { mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, rmSync, existsSync } from 'fs'
import PlayerData, { PlayerDataZod } from "../types/player_data.js"
import { StoredGameData, StoredGameDataZod } from '../types/game_data.js'
import Result from '../types/result.js'
import AdmZip from 'adm-zip'
import z from 'zod/v4'
import Faction, {FactionZod} from '../types/faction.js'
import { StoredGamePlayerData, StoredGamePlayerDataZod } from '../types/game_player_data.js'

const data_dir = "./data/";
class CachedFile<T>{
    file_path: string;
    content: T[] | null;
    zodType: z.ZodType<T>

    constructor(file_path: string, zodType: z.ZodType<T>){
        this.file_path = file_path
        this.content = null;
        this.zodType = zodType
    }

    get(): T[]{
        if (this.content !== null){return this.content}
        const data = readFileSync(this.file_path, 'utf8')
        const jsonContent = JSON.parse(data)
        this.content = jsonContent as T[];

        return this.content
    }
    set(content: T[]): void{
        this.content = content
        writeFileSync(this.file_path, JSON.stringify(this.content, null, 4))
    }
    add(value: T): void{
        if (this.content === null) {this.content = this.get()}
        this.content.push(value);
        this.set(this.content)
    }
    validate_content() {
        return validate_object_is_list_of_objects<T[]>(this.get(), this.zodType)
    }

};

export const data = {
    admins: new CachedFile<string>(data_dir + 'admins.json', z.string()),
    factions: new CachedFile<Faction>(data_dir + 'factions.json', FactionZod),
    games: new CachedFile<StoredGameData>(data_dir + 'games.json', StoredGameDataZod),
    game_player_data: new CachedFile<StoredGamePlayerData>(data_dir + 'game_player_stats.json', StoredGamePlayerDataZod),
    players: new CachedFile<PlayerData>(data_dir + 'players.json', PlayerDataZod),
};

export function dump_state_as_buffer(): Result<Buffer, string>{
    const validation_result = validate_stored_state()
    if (validation_result._tag === "Failure") return validation_result;

    const zip = new AdmZip();

    Object.values(data).forEach(cached_file => zip.addLocalFile(cached_file.file_path))

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

    Object.values(data).forEach(cached_file => 
        renameSync(cached_file.file_path, cached_file.file_path.replace(data_dir, temporary_data_dir))
    )

    zip.extractAllTo(data_dir)
    const validation_result = validate_stored_state()
    if (validation_result._tag === "Failure"){
        Object.values(data).forEach(cached_file => unlinkSync(cached_file.file_path))
        Object.values(data).forEach(cached_file => 
            renameSync(cached_file.file_path.replace(data_dir, temporary_data_dir), cached_file.file_path)
        )
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

    Object.values(data).forEach(
        (cached_file) => {
            const result = cached_file.validate_content();
            if (result._tag === "Failure") { failures.set(cached_file.file_path, result.error) };
        }
    )

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

function validate_object_is_list_of_objects<T>(content: T, type: z.ZodType): Result<null, z.ZodError>{
    const schema = z.array(type)

    try {
        schema.parse(content);
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

export default data;