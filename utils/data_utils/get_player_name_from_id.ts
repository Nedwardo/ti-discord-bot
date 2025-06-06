import Result from "../types/result.js";
import data from "./persistent_store.js";

function get_player_name_from_id(player_id: string): Result<string, string>{

    const matches = data.players.get().filter((player_info) => player_info.id === player_id);
    if (matches.length === 0){
        return {
            _tag: "Failure",
            error: "Could not find player id: " + player_id + " in player data, check players.json and player id"
        }
    }
    
    if (matches.length > 1){
        return {
            _tag: "Failure",
            error: "More than one match for player id: " + player_id + " in player data, check players.json and player id"
        }

    }

    const match = matches[0]
    if (!match){
        return {
            _tag: "Failure",
            error: "This is just to shut up typescript"
        }
    }
    return {
        _tag: "Success",
        data: match.name
    };
}

export default get_player_name_from_id;